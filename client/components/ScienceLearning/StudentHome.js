import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "expo-router";
import * as Speech from "expo-speech"; // For text-to-speech
import { Ionicons } from "@expo/vector-icons"; // Mic Icon

const StudentHome = ({
  startRecording,
  stopRecording,
  transcribedSpeech,
  isRecording,
  isTranscribing,
  setTranscribedSpeech,
}) => {
  const navigation = useNavigation();
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);

  // Welcome message with instructions on voice commands
  useEffect(() => {
    const welcomeMessage = `
      Welcome to Science learning. To access notes, say "lessons". 
      To access flashcards, say "flashcards". 
      Tap the mic button to begin speaking.
    `;

    // Speak the welcome message
    Speech.speak(welcomeMessage);

    return () => {
      Speech.stop();
    };
  }, []);

  // Use Effect to trigger actions based on transcribed speech
  useEffect(() => {
    if (transcribedSpeech) {
      setIsTranscriptionVisible(true);

      const handleNavigation = () => {
        if (transcribedSpeech.includes("lessons")) {
          navigation.navigate("NotesOverview");
        } else if (transcribedSpeech.includes("flashcards")) {
          navigation.navigate("FlashcardOverview");
        } else {
          Speech.speak("Sorry, I didn't understand. Please say it again.");
          Speech.stop();
          setTranscribedSpeech(""); // Clear after unsuccessful recognition
        }
      };

      handleNavigation();

      const timer = setTimeout(() => {
        setIsTranscriptionVisible(false);
        setTranscribedSpeech(""); // Clear after handling
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [transcribedSpeech]);

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
      <Text style={styles.title}>Science Learning</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.push("NotesOverview");
        }}
      >
        <Text style={styles.buttonText}>Access Notes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.push("FlashcardOverview");
        }}
      >
        <Text style={styles.buttonText}>Access Flashcards</Text>
      </TouchableOpacity>

      {/* Add the mic button for voice commands */}
      <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
        <Ionicons
          name={isRecording ? "stop-circle" : "mic"}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      {/* Show transcription if available */}
      {isTranscribing && <Text>Transcribing...</Text>}
      {isTranscriptionVisible && !isTranscribing && transcribedSpeech && (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionText}>{transcribedSpeech}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000080",
  },
  button: {
    backgroundColor: "#000080",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
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

export default StudentHome;
