import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db } from "../../hooks/firebase"; // Import Firestore DB connection
import { serverTimestamp } from "firebase/firestore";
import * as Speech from "expo-speech"; // For text-to-speech

const AddTasks = ({
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
  const [date, setDate] = useState(new Date().toLocaleDateString()); // Initialize with current date
  const [time, setTime] = useState(new Date().toLocaleTimeString()); // Initialize with current time
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  useEffect(() => {
    if (route.name === "AddTasks" && transcribedSpeech) {
      const lowerCaseSpeech = transcribedSpeech.toLowerCase();

      console.log("addTask", lowerCaseSpeech);

      // Check for task title
      if (lowerCaseSpeech.includes("title")) {
        const extractedTitle = lowerCaseSpeech.replace("title", "").trim();
        setTitle(extractedTitle);
      }

      // Check for task description
      if (lowerCaseSpeech.includes("description")) {
        const extractedDescription = lowerCaseSpeech
          .replace("description", "")
          .trim();
        setDescription(extractedDescription);
      }
      if (lowerCaseSpeech.includes("date")) {
        const extractedDescription = lowerCaseSpeech.replace("date", "").trim();

        genarateDate(extractedDescription);
      }
      if (lowerCaseSpeech.includes("time")) {
        const extractedDescription = lowerCaseSpeech.replace("time", "").trim();

        genarateTime(extractedDescription);
      }
      if (lowerCaseSpeech.includes("save task")) {
        console.log("hi", lowerCaseSpeech);

        handleAddTask();
      }

      // Clear the transcribed speech after processing
      setTranscribedSpeech("");
    }
  }, [transcribedSpeech]);

  const genarateDate = async (userMessage) => {
    const body = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Extract a date from the message: "${userMessage}". If there is a date mentioned, respond with the closest upcoming date in the format "MM/DD/YYYY" no matter what format is given. btw we are in 10/05/2024. If no date is found, respond with "null".`,
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
      const aiResponse =
        data.candidates[0]?.content?.parts[0]?.text || "No response from AI";

      // Add AI response to the messages list
      setDate(aiResponse);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
    } finally {
    }
  };
  const genarateTime = async (userMessage) => {
    const body = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Extract a time from the message: "${userMessage}". If a time is mentioned, respond with this format "hh:mm:ss AM/PM" no matter what use gave. If no time is found, respond with "null".
`,
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
      const aiResponse =
        data.candidates[0]?.content?.parts[0]?.text || "No response from AI";

      // Add AI response to the messages list
      setTime(aiResponse);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
    } finally {
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

  const handleAddTask = async () => {
    if (!title || !description || !date || !time) {
      Speech.speak("Please fill in all fields.");
      return;
    }

    console.log(title, description, date, time);

    try {
      await db.collection("tasks").add({
        title: title,
        description: description,
        dueDate: date,
        dueTime: time,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setDescription("");
      setDate(new Date().toLocaleDateString());
      setTime(new Date().toLocaleTimeString());
      navigation.navigate("TasksManagement");
    } catch (error) {
      Speech.speak("Failed to add task. Please try again.");
      console.error("Error adding document: ", error);
    }
  };

  // Date Picker Handler
  const showDatePickerDialog = () => {
    setShowDatePicker(true);
  };

  const showTimePickerDialog = () => {
    setShowTimePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate.toLocaleDateString()); // Update the state with selected date
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime.toLocaleTimeString()); // Update the state with selected time
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedules</Text>

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
        value={date}
        onFocus={showDatePickerDialog}
      />

      {/* Time Input */}
      <TextInput
        style={styles.input}
        placeholder="Select Due Time"
        value={time}
        onFocus={showTimePickerDialog}
      />

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleTimeChange}
        />
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleAddTask}>
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
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000080",
    marginBottom: 40,
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
});

export default AddTasks;
