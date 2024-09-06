import React, { useState } from "react";
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


const AddTasks = () => {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString()); // Initialize with current date
  const [time, setTime] = useState(new Date().toLocaleTimeString()); // Initialize with current time
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();

  const handleAddTask = async () => {

    if (!title || !description || !date || !time) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      await db.collection("tasks").add({
        title: title,
        description: description,
        dueDate: date,
        dueTime: time,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      Alert.alert("Success", "Task added successfully!");
      setTitle("");
      setDescription("");
      setDate(new Date().toLocaleDateString());
      setTime(new Date().toLocaleTimeString());
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to add task. Please try again.");
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
        <Text style={styles.submitButtonText}>Add Task</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.micButton}>
        <Ionicons name="mic" size={24} color="white" />
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
    width: "80%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
  },
  submitButton: {
    width: "80%",
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
    width: 60,
    height: 60,
    marginBottom: 20,
    borderRadius: 30,
    backgroundColor: "#000080",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AddTasks;
