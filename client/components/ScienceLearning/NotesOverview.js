import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../hooks/firebase"; // Firebase config file
import * as Speech from "expo-speech"; // Import Speech API
import { Ionicons } from "@expo/vector-icons"; // For mic icon

const NotesOverview = ({
  startRecording,
  stopRecording,
  transcribedSpeech,
  isRecording,
  isTranscribing,
  setTranscribedSpeech,
}) => {
  const [notes, setNotes] = useState([]);
  const [isReading, setIsReading] = useState(false); // State to track reading status
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);
  const navigation = useNavigation();

  // Fetch notes from Firestore on mount
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

  // Welcome message for Notes Overview
  useEffect(() => {
    if (notes.length > 0) {
      // Generate a list of note titles
      const noteTitles = notes.map((note) => note.title).join(", ");

      // Create a dynamic welcome message with note titles
      const welcomeMessage = `Welcome to Notes Overview. To access a note, say the note title. 
      Available notes are: ${noteTitles}. 
      To read aloud a note, say "read" followed by the note title. 
      To stop reading, say "stop." Tap the mic button to begin speaking.`;

      // Speak the welcome message
      Speech.speak(welcomeMessage);

      return () => {
        Speech.stop();
      };
    }
  }, [notes]);

  // Handle voice commands based on transcribed speech
  useEffect(() => {
    if (transcribedSpeech) {
      setIsTranscriptionVisible(true);

      const handleVoiceCommand = () => {
        const transcribedLower = transcribedSpeech.toLowerCase();

        // Handle "stop" command to stop reading
        if (transcribedLower.includes("stop")) {
          Speech.stop();
          setTranscribedSpeech(""); // Clear after handling
          setIsTranscriptionVisible(false);
          return;
        }

        // Find a note that matches the spoken title
        const matchedNote = notes.find((note) =>
          transcribedLower.includes(note.title.toLowerCase())
        );

        // Check if the command is to read the note
        const isReadCommand = transcribedLower.includes("read");

        if (matchedNote) {
          // If "read" command is detected, read the note aloud
          if (isReadCommand) {
            handleReadNote(matchedNote);
          } else {
            // If just the note title is mentioned, navigate to the note detail page
            handleNavigateToNote(matchedNote.id);
          }
        } else {
          // If no note matches, provide feedback
          Speech.speak("Sorry, I didn't understand. Please try again.");
        }
        Speech.stop();

        // Clear the transcribed speech after handling the command
        setTranscribedSpeech("");
      };

      handleVoiceCommand();

      const timer = setTimeout(() => {
        setIsTranscriptionVisible(false);
        setTranscribedSpeech(""); // Clear after handling
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [transcribedSpeech]);

  // Navigate to NoteDetail page
  const handleNavigateToNote = (noteId) => {
    navigation.navigate("NoteDescription", { noteId: noteId });
  };

  // Read note aloud using Speech API
  const handleReadNote = (note) => {
    setIsReading(true);
    Speech.speak(`${note.title}. ${note.description}`, {
      onDone: () => setIsReading(false),
      onStopped: () => setIsReading(false),
    });
  };

  const stopReading = () => {
    Speech.stop();
    setIsReading(false);
  };

  // Handle mic button press
  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    setIsTranscriptionVisible(true);
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

      {/* Add the mic button for voice commands */}
      {/* Wrapper to center the mic button */}
      <View style={styles.micWrapper}>
        <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
          <Ionicons
            name={isRecording ? "stop-circle" : "mic"}
            size={30}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* Show transcription if available */}
      {isTranscribing && (
        <Text style={{ textAlign: "center" }}>Transcribing...</Text>
      )}
      {isTranscriptionVisible && !isTranscribing && transcribedSpeech && (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionText}>{transcribedSpeech}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 30,
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
  micWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  transcriptionContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transcriptionText: {
    fontSize: 16,
    color: "#000",
  },
});

export default NotesOverview;
