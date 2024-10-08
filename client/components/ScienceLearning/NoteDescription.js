import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../hooks/firebase";
import { useNavigation, useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";
import * as Speech from "expo-speech"; // Import Speech API
import { Ionicons } from "@expo/vector-icons"; // For mic icon

const NoteDescription = ({
  startRecording,
  stopRecording,
  transcribedSpeech,
  isRecording,
  isTranscribing,
  setTranscribedSpeech,
}) => {
  const [note, setNote] = useState(null);
  const router = useRouter();
  const navigation = useNavigation();
  const route = useRoute();
  const { noteId } = route.params || {}; // Ensure noteId is defined
  const [isReading, setIsReading] = useState(false); // State to track reading status
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);

  // Fetch the note details from Firestore based on noteId
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
      fetchNote();
    } else {
      Alert.alert("Error", "No note ID provided");
      router.back();
    }
  }, [noteId]);

  // Welcome message for Note Description
  useEffect(() => {
    if (note) {
      const welcomeMessage = `You are viewing the note titled ${note.title}. 
      To read aloud this note, say "read" followed by "this note". 
      To stop reading, say "stop". Tap the mic button, located at the bottom of the page, to begin speaking. 
      Please scroll down to find the mic button.`;

      // Speak the welcome message
      Speech.speak(welcomeMessage);

      return () => {
        Speech.stop();
      };
    }
  }, [note]);

  // Handle voice commands based on transcribed speech
  useEffect(() => {
    if (transcribedSpeech) {
      setIsTranscriptionVisible(true);

      const handleVoiceCommand = () => {
        const transcribedLower = transcribedSpeech.toLowerCase();

        // Stop reading command
        if (transcribedLower.includes("stop")) {
          Speech.stop();
          setTranscribedSpeech(""); // Clear after handling
          setIsTranscriptionVisible(false);
          return;
        }

        // Read note aloud command
        if (transcribedLower.includes("read this note")) {
          handleReadNote();
        } else {
          Speech.speak("Sorry, I didn't understand. Please try again.");
        }

        // Clear the transcribed speech after handling
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

  // Handle reading the note aloud
  const handleReadNote = () => {
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

  if (!note) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.description}>{note.description}</Text>

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

        {/* Add the mic button for voice commands below the read/stop buttons */}
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
        {isTranscribing && <Text>Transcribing...</Text>}
        {isTranscriptionVisible && !isTranscribing && transcribedSpeech && (
          <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionText}>{transcribedSpeech}</Text>
          </View>
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
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
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
    backgroundColor: "#FF4D4D", // Red background for stop button
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  micWrapper: {
    marginTop: 20, // Add margin to separate it from the buttons above
    justifyContent: "center",
    alignItems: "center",
  },
  micButton: {
    width: 80,
    height: 80,
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

export default NoteDescription;
