import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native";
import { db } from "../../hooks/firebase"; // Import Firestore DB connection
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { Ionicons } from "@expo/vector-icons"; // Import icons from Expo
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import * as Speech from "expo-speech";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const TasksManagement = ({
  startRecording,
  stopRecording,
  transcribedSpeech,
  isRecording,
  isTranscribing,
  setTranscribedSpeech,
}) => {
  const [tasks, setTasks] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    const handleNavigation = async () => {
      if (route.name === "TasksManagement" && transcribedSpeech) {
        const lowerCaseSpeech = transcribedSpeech.toLowerCase();
        console.log("taskmanagement", lowerCaseSpeech);

        if (route.name === "AddTasks") return; // Avoid handling commands on the AddTasks screen

        // Handle "add task" command
        if (lowerCaseSpeech.includes("add task")) {
          setTranscribedSpeech(""); // Clear the transcription
          Speech.stop();
          navigation.navigate("AddTasks");
        }
        // Handle "delete task" command
        else if (lowerCaseSpeech.startsWith("delete ")) {
          const taskNameFragment = lowerCaseSpeech
            .replace("delete ", "")
            .trim();
          const matchedTask = tasks.find((task) =>
            task.title.toLowerCase().includes(taskNameFragment)
          );

          if (matchedTask) {
            await handleDeleteTask(matchedTask.id);
            Speech.speak(`${matchedTask.title} has been deleted.`);
          } else {
            Speech.speak("Task not found, please try again.");
          }
        }
        // Handle "edit task" command
        else if (lowerCaseSpeech.startsWith("edit ")) {
          const taskNameFragment = lowerCaseSpeech.replace("edit ", "").trim();
          const matchedTask = tasks.find((task) =>
            task.title.toLowerCase().includes(taskNameFragment)
          );

          if (matchedTask) {
            setTranscribedSpeech("");
            handleEditTask(matchedTask.id);
            // Clear after handling
          } else {
            Speech.speak("Task not found, please try again.");
          }
        }
        // Handle "complete task" command
        else if (lowerCaseSpeech.includes("complete ")) {
          const taskNameFragment = lowerCaseSpeech
            .replace("complete ", "")
            .trim();
          const matchedTask = tasks.find((task) =>
            task.title.toLowerCase().includes(taskNameFragment)
          );

          if (matchedTask) {
            await handleCompleteTask(matchedTask.id);
            Speech.speak(`${matchedTask.title} has been marked as completed.`);
          } else {
            Speech.speak("Task not found, please try again.");
          }
        } else if (lowerCaseSpeech.includes("generate report")) {
          generatePDF();
        }

        // Clear the transcription after handling
        setTranscribedSpeech("");
      }
    };

    // Call the async function
    handleNavigation();

    // Optional: Add a timeout to clear transcribedSpeech after 1 second
    const timer = setTimeout(() => {
      setTranscribedSpeech(""); // Clear after handling
    }, 1000);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      Speech.stop();
    };
  }, [transcribedSpeech, route.name, tasks, navigation]);

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setTranscribedSpeech(""); // Clear previous transcribed speech
      startRecording();
    }
  };

  // Function to fetch tasks from Firestore
  const fetchTasks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "tasks"));
      const tasksList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksList);
      console.log("Tasks fetched successfully: ", tasksList);
    } catch (error) {
      console.error("Error fetching tasks: ", error);
    }
  };
  const generatePDF = async () => {
    // Group tasks by due date
    const groupedTasks = tasks.reduce((acc, task) => {
      const dueDate = task.dueDate; // Use your task's due date logic here
      if (!acc[dueDate]) {
        acc[dueDate] = [];
      }
      acc[dueDate].push(task);
      return acc;
    }, {});

    const htmlContent = `
    <html>
      <head>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          h1 {
            text-align: center;
            color: #000080;
          }
        </style>
      </head>
      <body>
        <h1>InsightEye</h1>
        ${Object.keys(groupedTasks)
          .map(
            (dueDate) => `
          <h2>Due Date: ${dueDate}</h2>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${groupedTasks[dueDate]
                .map(
                  (task) => `
                <tr>
                  <td>${task.title}</td>
                  <td>${task.description}</td>
                  <td>${task.dueTime}</td>
                  <td>${task.status}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        `
          )
          .join("")}
      </body>
    </html>
  `;

    // Create a PDF from the HTML content
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri);
  };

  // Fetch tasks when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  // Function to handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      Alert.alert("Error", "Failed to delete task. Please try again.");
      console.error("Error deleting task: ", error);
    }
  };

  // Function to handle task editing
  const handleEditTask = (taskId) => {
    setTranscribedSpeech(""); // Clear transcribed speech
    Speech.stop();
    navigation.navigate("EditTask", { taskId }); // Replace 'EditTask' with your edit screen name
  };

  // Function to handle task completion
  const handleCompleteTask = async (taskId) => {
    try {
      const taskDoc = doc(db, "tasks", taskId);
      await updateDoc(taskDoc, { status: "completed" });
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: "completed" } : task
        )
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update task status. Please try again.");
      console.error("Error updating task status: ", error);
    }
  };

  // Render each task item
  const renderItem = ({ item }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDes}>{item.description}</Text>
      <View style={styles.dueInfoContainer}>
        <Text style={styles.dueText}>
          {item.dueDate} at {item.dueTime}
        </Text>
      </View>
      <View style={styles.taskActions}>
        {item.status === "pending" && (
          <TouchableOpacity onPress={() => handleCompleteTask(item.id)}>
            <Text style={styles.completeButton}>Complete</Text>
          </TouchableOpacity>
        )}
        {item.status !== "completed" && (
          <TouchableOpacity onPress={() => handleEditTask(item.id)}>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
          <Text style={styles.deleteButton}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddTasks")}
      >
        <Text style={styles.addButtonText}>Add New Task</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton} onPress={generatePDF}>
        <Text style={styles.addButtonText}>Generate PDF</Text>
      </TouchableOpacity>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
        <Ionicons
          name={isRecording ? "stop-circle" : "mic"}
          size={30}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  micButton: {
    position: "absolute",
    bottom: 20,
    width: 80,
    height: 80,
    marginBottom: 20,
    borderRadius: 100,
    backgroundColor: "#000080",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000080",
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  addButton: {
    padding: 20,
    backgroundColor: "#000080",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  taskItem: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  taskTitle: {
    color: "#000080",
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
  },
  taskDes: {
    fontSize: 20,
    fontWeight: "bold",
  },
  taskActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 30,
  },
  editButton: {
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#000080",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    borderRadius: 8,
  },
  deleteButton: {
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#ff0000",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    borderRadius: 8,
  },
  completeButton: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#008000",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    borderRadius: 8,
  },
  dueInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  dueText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default TasksManagement;
