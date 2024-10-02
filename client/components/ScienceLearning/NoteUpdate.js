// app/NoteUpdate.js
import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../hooks/firebase.jsx";
import { useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";

const NoteUpdate = () => {
  const [note, setNote] = useState({ title: "", description: "" });
  const router = useRouter();
  const route = useRoute();
  const { noteId } = route.params;

  useEffect(() => {
    const fetchNote = async () => {
      const docRef = doc(db, "sciencenotes", noteId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setNote(docSnap.data());
      } else {
        Alert.alert("Error", "Note not found");
        router.back();
      }
    };

    fetchNote();
  }, [noteId]);

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, "sciencenotes", noteId);
      await updateDoc(docRef, {
        title: note.title,
        description: note.description,
      });
      Alert.alert("Success", "Note updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update note");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={note.title}
        onChangeText={(text) => setNote({ ...note, title: text })}
      />
      <TextInput
        style={[styles.input, styles.textArea]} // Add textArea style for better appearance
        placeholder="Description"
        value={note.description}
        onChangeText={(text) => setNote({ ...note, description: text })}
        multiline
      />
      <TouchableOpacity
        style={[styles.button, styles.updateButton]}
        onPress={handleUpdate}
      >
        <Text style={styles.buttonText}>Update Note</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#000080",
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 18,
  },
  textArea: {
    height: 150, // Set a height for the text area
    textAlignVertical: "top", // Aligns text at the top in multiline input
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
    marginTop: 20,
  },
  updateButton: {
    backgroundColor: "#000080",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default NoteUpdate;
