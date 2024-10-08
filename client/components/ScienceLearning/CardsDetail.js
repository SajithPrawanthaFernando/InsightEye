import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../hooks/firebase.jsx";
import { translateToSinhala } from "../../hooks/apiConfig";
import { useRoute } from "@react-navigation/native";
import * as Speech from "expo-speech"; // Import Speech API
import { Ionicons } from "@expo/vector-icons"; // For mic icon

const CardsDetail = ({
  startRecording,
  stopRecording,
  transcribedSpeech,
  isRecording,
  isTranscribing,
  setTranscribedSpeech,
}) => {
  const [flashcard, setFlashcard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sinhalaSummary, setSinhalaSummary] = useState("");
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);
  const [isReading, setIsReading] = useState(false); // State to track reading status

  // Get route params
  const route = useRoute();
  const { flashcardId } = route.params; // Access flashcardId from route params

  useEffect(() => {
    const fetchFlashcard = async () => {
      try {
        const docRef = doc(db, "flashcards", flashcardId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFlashcard(data);

          // Translate to Sinhala once the flashcard is fetched
          const sinhalaTranslation = await translateToSinhala(data.summary);
          setSinhalaSummary(sinhalaTranslation);
        } else {
          Alert.alert("Error", "Flashcard not found");
        }
      } catch (error) {
        console.error("Error fetching flashcard: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (flashcardId) {
      fetchFlashcard();
    } else {
      Alert.alert("Error", "No flashcard ID provided");
    }
  }, [flashcardId]);

  // Welcome message for Flashcard Detail
  useEffect(() => {
    if (flashcard) {
      const welcomeMessage = `You are viewing the flashcard titled ${flashcard.title}. 
      To read the summary in English, say "read in English". 
      To read the summary in Sinhala, say "translated description". 
      To stop reading, say "stop". Tap the mic button, located at the bottom of the page, to begin speaking. 
      Please scroll down to find the mic button.`;

      // Speak the welcome message
      Speech.speak(welcomeMessage);

      return () => {
        Speech.stop();
      };
    }
  }, [flashcard]);

  // Handle voice commands based on transcribed speech
  useEffect(() => {
    if (transcribedSpeech) {
      setIsTranscriptionVisible(true);

      const handleVoiceCommand = () => {
        const command = transcribedSpeech.toLowerCase();

        if (command.includes("read in english")) {
          handleReadEnglish();
        } else if (command.includes("translated description")) {
          handleReadSinhala();
        } else if (command.includes("stop")) {
          handleStopReading();
        } else {
          Speech.speak(
            "Sorry, I didn't understand the command. Please try again."
          );
        }

        // Clear the transcribed speech after handling
        setTranscribedSpeech("");
      };

      handleVoiceCommand();

      const timer = setTimeout(() => {
        setIsTranscriptionVisible(false);
        setTranscribedSpeech(""); // Clear after handling
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [transcribedSpeech]);

  const handleReadEnglish = () => {
    setIsReading(true);
    // Speak the flashcard title and summary in English
    Speech.speak(`${flashcard.title}. ${flashcard.summary}`, {
      language: "en", // Specify English language
      onDone: () => setIsReading(false),
      onStopped: () => setIsReading(false),
    });
  };

  const handleReadSinhala = () => {
    setIsReading(true);
    // Speak the flashcard title and summary in Sinhala
    Speech.speak(`${flashcard.title}. ${sinhalaSummary}`, {
      language: "si", // Specify Sinhala language
      onDone: () => setIsReading(false),
      onStopped: () => setIsReading(false),
    });
  };

  const handleStopReading = () => {
    // Stop any ongoing speech
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

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#000080" style={styles.loader} />
    );
  }

  if (!flashcard) {
    return <Text style={styles.errorText}>Flashcard not found</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{flashcard.title}</Text>
        <Text style={styles.summary}>{flashcard.summary}</Text>
        <Text style={styles.sinhalaSummary}>{sinhalaSummary}</Text>

        {/* TouchableOpacity for custom buttons */}
        <TouchableOpacity style={styles.button} onPress={handleReadEnglish}>
          <Text style={styles.buttonText}>Read in English</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleReadSinhala}>
          <Text style={styles.buttonText}>Read in Sinhala</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.stopButton]}
          onPress={handleStopReading}
        >
          <Text style={styles.buttonText}>Stop Reading</Text>
        </TouchableOpacity>

        {/* Move the mic button below the three buttons */}
        <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
          <Ionicons
            name={isRecording ? "stop-circle" : "mic"}
            size={30}
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
    alignItems: "center", // Center the content horizontally
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000080",
    marginBottom: 20,
  },
  summary: {
    fontSize: 18,
    marginBottom: 10,
    color: "#333",
  },
  sinhalaSummary: {
    fontSize: 18,
    marginTop: 10,
    color: "#000080",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  errorText: {
    textAlign: "center",
    fontSize: 18,
    color: "red",
  },
  button: {
    backgroundColor: "#000080",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
    width: "80%", // Added width for button consistency
  },
  stopButton: {
    backgroundColor: "#FF0000", // Red color for the stop button
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  micButton: {
    marginTop: 20, // Add margin for spacing
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

export default CardsDetail;
