import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../../hooks/firebase"; // Ensure this path is correct
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import * as Speech from "expo-speech"; // For text-to-speech
import { Ionicons } from "@expo/vector-icons";

const EditTask = ({
  startRecording,
  stopRecording,
  transcribedSpeech,
  isRecording,
  isTranscribing,
  setTranscribedSpeech,
}) => {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDKPiJ0QAFCm0qpydBNa9oegvIOzmTvj0U";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { taskId } = route.params;

  useEffect(() => {
    console.log(route.name);
    if (route.name === "EditTask" && transcribedSpeech) {
      const lowerCaseSpeech = transcribedSpeech.toLowerCase();

      // Log the transcribed speech for debugging
      // console.log("Transcribed Speech: ", lowerCaseSpeech);
      console.log("Transcribed Speech: ", lowerCaseSpeech);

      // Check for task title
      if (lowerCaseSpeech.includes("title")) {
        const extractedTitle = lowerCaseSpeech
          .replace("update title", "")
          .trim();
        setTitle(extractedTitle);
      }

      // Check for task description
      if (lowerCaseSpeech.includes("description")) {
        const extractedDescription = lowerCaseSpeech
          .replace("description", "")
          .trim();
        setDescription(extractedDescription);
      }

      // Check for date and time
      if (lowerCaseSpeech.includes("date")) {
        const extractedDate = lowerCaseSpeech.replace("date", "").trim();
        genarateDate(extractedDate);
      }

      if (lowerCaseSpeech.includes("time")) {
        const extractedTime = lowerCaseSpeech.replace("time", "").trim();
        genarateTime(extractedTime);
      }

      // Trigger task update if "update task" is mentioned
      if (lowerCaseSpeech.includes("update task")) {
        handleUpdateTask();
      }

      // Update states

      // Clear the transcribed speech after processing
      setTranscribedSpeech(""); // This ensures the effect is triggered again on new input
    }
  }, [transcribedSpeech]);
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskDoc = doc(db, "tasks", taskId);
        const taskSnap = await getDoc(taskDoc);
        if (taskSnap.exists()) {
          const taskData = taskSnap.data();
          setTitle(taskData.title);
          setDescription(taskData.description);

          // Convert dueDate string to Date object
          const [month, day, year] = taskData.dueDate
            .split("/")
            .map((num) => parseInt(num, 10));
          setDate(new Date(year, month - 1, day)); // Note: month is 0-based

          // Convert time string to Date object
          const [hours, minutes, seconds] = taskData.dueTime.split(":");
          const ampm = taskData.dueTime.split(" ")[1];
          const hours24 =
            ampm === "PM" ? parseInt(hours, 10) + 12 : parseInt(hours, 10);
          const timeString = `${hours24}:${minutes}:${seconds}`;
          const timeDate = new Date();
          const [hh, mm, ss] = timeString
            .split(":")
            .map((num) => parseInt(num, 10));
          timeDate.setHours(hh, mm, ss);
          setTime(timeDate); // Use a Date object for time
        } else {
          Alert.alert("Error", "Task not found.");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch task. Please try again.");
        console.error("Error fetching task: ", error);
      }
    };

    fetchTask();
  }, [taskId]);

  const genarateDate = async (userMessage) => {
    const body = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Extract a date from the message: "${userMessage}". If there is a date mentioned, respond with the closest upcoming date in the format "MM/DD/YYYY". If no date is found, respond with "null".`,
            },
          ],
        },
      ],
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text || "null";

      if (aiResponse !== "null") {
        // Parse the AI response into a Date object
        const [month, day, year] = aiResponse
          .split("/")
          .map((num) => parseInt(num, 10));
        const parsedDate = new Date(year, month - 1, day);
        setDate(parsedDate); // Set as Date object
      } else {
        console.error("No valid date found in AI response");
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
    }
  };

  const genarateTime = async (userMessage) => {
    const body = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Extract a time from the message: "${userMessage}". Respond in "hh:mm:ss AM/PM" format. If no time is found, respond with "null".`,
            },
          ],
        },
      ],
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text || "null";

      if (aiResponse !== "null") {
        // Parse the AI response into a time format
        const [timePart, ampm] = aiResponse.split(" ");
        const [hours, minutes, seconds] = timePart
          .split(":")
          .map((num) => parseInt(num, 10));
        const dateTime = new Date();
        const hours24 = ampm === "PM" && hours !== 12 ? hours + 12 : hours;
        dateTime.setHours(hours24, minutes, seconds);
        setTime(dateTime); // Set as Date object
      } else {
        console.error("No valid time found in AI response");
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setTranscribedSpeech(""); // Clear previous transcribed speech
      startRecording();
    }
  };

  const handleUpdateTask = async () => {
    if (!title || !description || !date || !time) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const taskDoc = doc(db, "tasks", taskId);
      await updateDoc(taskDoc, {
        title,
        description,
        dueDate: `${
          date.getMonth() + 1
        }/${date.getDate()}/${date.getFullYear()}`, // Format date as string
        dueTime: time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }), // Format time as string
        updatedAt: serverTimestamp(),
      });

      navigation.navigate("TasksManagement");

      // Navigate back to the previous screen
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };

  const showDatePickerDialog = () => {
    setShowDatePicker(true);
  };

  const showTimePickerDialog = () => {
    setShowTimePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Task</Text>

      {/* Task Input Form */}
      <TextInput
        style={styles.input}
        placeholder="Task Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline={true}
      />

      {/* Date Input */}
      <TextInput
        style={styles.input}
        placeholder="Select Due Date"
        value={date.toLocaleDateString()} // Display date as mm/dd/yyyy
        onFocus={showDatePickerDialog}
      />

      {/* Time Input */}
      <TextInput
        style={styles.input}
        placeholder="Select Due Time"
        value={time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })} // Display time as hh:mm:ss AM/PM
        onFocus={showTimePickerDialog}
      />

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleTimeChange}
        />
      )}
      <TouchableOpacity style={styles.submitButton} onPress={handleUpdateTask}>
        <Text style={styles.submitButtonText}>Save Task</Text>
      </TouchableOpacity>

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
    alignItems: "center",
    marginTop: 80,
    backgroundColor: "#f5f5f5",
  },

  input: {
    width: "90%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000080",
    marginBottom: 40,
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
  },
  submitButton: {
    width: "90%",
    padding: 15,
    backgroundColor: "#000080",
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditTask;
