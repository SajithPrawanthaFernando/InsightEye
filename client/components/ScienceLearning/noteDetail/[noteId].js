// app/noteDetail/[noteId].js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../hooks/firebase.jsx"; // Adjusted path to firebaseConfig
import * as Speech from "expo-speech"; // Import Speech API

const NoteDetail = () => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReading, setIsReading] = useState(false); // State to track reading status
  const { noteId } = useLocalSearchParams();

  useEffect(() => {
    const fetchNote = async () => {
      const docRef = doc(db, "sciencenotes", noteId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setNote(docSnap.data());
      }
      setLoading(false);
    };
    fetchNote();
  }, [noteId]);

  const handleReadNote = () => {
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

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#000080" style={styles.loader} />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{note?.title}</Text>
        <Text style={styles.description}>{note?.description}</Text>

        {/* TouchableOpacity for "Read Aloud" button */}
        {!isReading && (
          <TouchableOpacity style={styles.readButton} onPress={handleReadNote}>
            <Text style={styles.buttonText}>Read Aloud</Text>
          </TouchableOpacity>
        )}

        {/* TouchableOpacity for "Stop Reading" button */}
        {isReading && (
          <TouchableOpacity style={styles.stopButton} onPress={stopReading}>
            <Text style={styles.buttonText}>Stop Reading</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    marginBottom: 16,
    textAlign: "center",
    color: "#000080",
  },
  description: {
    fontSize: 18,
    color: "#333",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  readButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#000080", // Blue background for read button
    borderRadius: 8,
    alignItems: "center",
  },
  stopButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#FF4D4D",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default NoteDetail;
