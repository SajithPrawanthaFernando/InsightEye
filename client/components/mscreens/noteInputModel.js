import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { db } from "../../hooks/firebase";
import { collection, addDoc } from "firebase/firestore";

const NoteInputScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Both title and content are required.");
      return;
    }
    try {
      await addDoc(collection(db, "notes"), { title, content });
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not save the note.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Lesson</Text>

      <Text style={styles.label}>Lesson Title:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter the lesson title"
        placeholderTextColor="#808080"
      />

      <Text style={styles.label}>Lesson Content:</Text>
      <TextInput
        style={[styles.input, styles.contentInput]}
        value={content}
        onChangeText={setContent}
        placeholder="Enter the lesson content"
        placeholderTextColor="#808080"
        multiline
        textAlignVertical="top" // Ensures text starts at the top of the TextInput
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Note</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5", // Light background similar to the previous screen
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000080", // Dark blue color used for titles
    textAlign: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: "#000080", // Dark blue label color
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: "#000080", // Dark blue border to match the theme
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: "#fff", // White background for input fields
    marginBottom: 20,
  },
  contentInput: {
    height: 300, // Set a larger height for content input
    paddingVertical: 10, // Add vertical padding for better spacing
  },
  saveButton: {
    backgroundColor: "#000080", // Blue button color used in previous design
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default NoteInputScreen;
