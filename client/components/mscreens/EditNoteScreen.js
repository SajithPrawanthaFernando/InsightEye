import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { db } from "../../hooks/firebase";
import { updateDoc, doc } from "firebase/firestore";
import Icon from "react-native-vector-icons/AntDesign";

const EditNoteScreen = ({ route, navigation }) => {
  const { note } = route.params; // Note object passed from previous screen
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Both title and content are required.");
      return;
    }

    try {
      const noteRef = doc(db, "notes", note._id);
      await updateDoc(noteRef, { title, content });
      Alert.alert("Success", "Note updated successfully.");
      navigation.goBack(); // Navigate back to the previous screen
    } catch (error) {
      Alert.alert("Error", "Could not update the note.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Lesson</Text>

      <Text style={styles.label}>Lesson Title:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter lesson title"
        placeholderTextColor="#808080"
      />

      <Text style={styles.label}>Lesson Content:</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]} // Apply both styles
        value={content}
        onChangeText={setContent}
        placeholder="Enter lesson content"
        placeholderTextColor="#808080"
        multiline
        textAlignVertical="top" // Ensures text starts from the top
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Icon name="save" size={20} color="#fff" />
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5", // Light background similar to the previous screens
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000080", // Dark blue color for the header
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  label: {
    fontSize: 18,
    color: "#000080", // Dark blue color for labels
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: "#000080", // Matching dark blue border color
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: "#fff", // White background for input fields
    marginBottom: 20,
  },
  multilineInput: {
    height: 300, // Set a larger height for content input
    paddingVertical: 10, // Add vertical padding for better spacing
  },
  saveButton: {
    backgroundColor: "#000080", // Same blue used for buttons in previous designs
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    flexDirection: "row", // For icon and text alignment
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10, // Space between the icon and text
  },
});

export default EditNoteScreen;
