// app/NotesOverview.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../hooks/firebase"; // Firebase config file
import * as Speech from "expo-speech"; // Import Speech API

const NotesOverview = () => {
  const [notes, setNotes] = useState([]);
  const [isReading, setIsReading] = useState(false); // State to track reading status
  const navigation = useNavigation();

  useEffect(() => {
    const fetchNotes = async () => {
      const querySnapshot = await getDocs(collection(db, "sciencenotes"));
      const notesArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(notesArray);
    };
    fetchNotes();
  }, []);

  const handleNavigateToNote = (noteId) => {
    navigation.navigate("NoteDetail", { noteId }); // Navigate to NoteDetail page
  };

  const handleReadNote = (note) => {
    setIsReading(true); // Set reading status to true
    // Speak the note title and description
    Speech.speak(`${note.title}. ${note.description}`, {
      onDone: () => setIsReading(false), // Reset reading status when done
      onStopped: () => setIsReading(false), // Reset reading status when stopped
    });
  };

  const stopReading = () => {
    Speech.stop(); // Stop reading
    setIsReading(false); // Update reading status
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notes Overview</Text>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.noteItem}
            onPress={() => handleNavigateToNote(item.id)}
          >
            <Text style={styles.noteTitle}>{item.title}</Text>
            <TouchableOpacity onPress={() => handleReadNote(item)}>
              <Text style={styles.readButton}>Read Aloud</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      {isReading && (
        <TouchableOpacity style={styles.stopButton} onPress={stopReading}>
          <Text style={styles.stopButtonText}>Stop Reading</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: {
    fontSize: 32,
    marginBottom: 16,
    textAlign: "center",
    color: "#000080",
  },
  noteItem: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 8,
  },
  noteTitle: { fontSize: 18, color: "#000" },
  readButton: { fontSize: 16, color: "#007BFF", marginTop: 10 },
  stopButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#FF4D4D",
    borderRadius: 8,
    alignItems: "center",
  },
  stopButtonText: { color: "#fff", fontSize: 18 },
});

export default NotesOverview;
