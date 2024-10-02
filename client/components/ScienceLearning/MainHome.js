import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons"; // Importing Material and Ionicons
import { useNavigation } from "expo-router";
import * as Speech from "expo-speech"; // For text-to-speech

const MainHome = ({
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
      Welcome to Main Home. For student home, say "student".
      For instructor home, say "instructor". To log out, say "log out". 
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
        if (transcribedSpeech.includes("student")) {
          navigation.navigate("StudentHome");
        } else if (transcribedSpeech.includes("instructor")) {
          navigation.navigate("InstructorHome");
        } else if (transcribedSpeech.includes("log out")) {
          Speech.speak("Logging out.");
          // Implement the logout logic if necessary
          navigation.navigate("login");
        } else {
          Speech.speak("Sorry, I didn't understand. Please say it again.");
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
      <Text style={styles.title}>Main Home</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.navigate("StudentHome");
        }}
      >
        <MaterialIcons name="school" size={24} color="white" />
        <Text style={styles.buttonText}>Student Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.navigate("InstructorHome");
        }}
      >
        <MaterialIcons name="home" size={24} color="white" />
        <Text style={styles.buttonText}>Instructor Home</Text>
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
    flexDirection: "row", // To display icon and text in a row
    alignItems: "center",
    backgroundColor: "#000080",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    width: "80%",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    marginLeft: 10, // Space between icon and text
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

export default MainHome;
