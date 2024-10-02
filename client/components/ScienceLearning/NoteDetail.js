// app/NoteDetail.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../hooks/firebase";
import { useNavigation, useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";

const NoteDetail = () => {
  const [note, setNote] = useState(null);
  const router = useRouter();
  const navigation = useNavigation();
  const route = useRoute();
  const { noteId } = route.params || {}; // Ensure noteId is defined

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

    if (noteId) {
      // Ensure noteId is available before fetching
      fetchNote();
    } else {
      Alert.alert("Error", "No note ID provided");
      router.back();
    }
  }, [noteId]);

  const handleDelete = async () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const docRef = doc(db, "sciencenotes", noteId);
            await deleteDoc(docRef);
            Alert.alert("Success", "Note deleted successfully", [
              { text: "OK", onPress: () => navigation.back() },
            ]);
          } catch (error) {
            Alert.alert("Error", "Failed to delete note");
          }
        },
      },
    ]);
  };

  if (!note) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{note.title}</Text>
      <Text style={styles.description}>{note.description}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={() => navigation.navigate("NoteUpdate", { noteId })}
        >
          <Text style={styles.buttonText}>Update Note</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Delete Note</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.updateButton]} // Reusing update button style for consistency
          onPress={() => navigation.navigate("FlashcardGenerator", { noteId })}
        >
          <Text style={styles.buttonText}>Generate Summary</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#000080",
  },
  description: {
    fontSize: 18,
    marginBottom: 20,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5, // Reduced the margin between buttons
    elevation: 5,
  },
  updateButton: {
    backgroundColor: "#000080",
  },
  deleteButton: {
    backgroundColor: "red",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
});

export default NoteDetail;
