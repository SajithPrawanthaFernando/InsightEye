import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../hooks/firebase";
import { useNavigation } from "expo-router";
import * as Speech from "expo-speech"; // Import Speech API
import { Ionicons } from "@expo/vector-icons"; // For mic icon

const FlashcardOverview = ({
  startRecording,
  stopRecording,
  transcribedSpeech,
  isRecording,
  isTranscribing,
  setTranscribedSpeech,
}) => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "flashcards"));
        const flashcardArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFlashcards(flashcardArray);
      } catch (error) {
        console.error("Error fetching flashcards: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  // Welcome message for Flashcard Overview
  useEffect(() => {
    if (flashcards.length > 0) {
      const flashcardTitles = flashcards
        .map((flashcard) => flashcard.title)
        .join(", ");

      const welcomeMessage = `
        Welcome to Flashcard List. Available flashcards are: ${flashcardTitles}.
        To access a flashcard, say the flashcard title. Tap the mic button to begin speaking.
      `;
      Speech.speak(welcomeMessage);

      return () => {
        Speech.stop();
      };
    }
  }, [flashcards]);

  // Handle voice commands based on transcribed speech
  useEffect(() => {
    if (transcribedSpeech) {
      setIsTranscriptionVisible(true);

      const handleVoiceCommand = () => {
        const transcribedLower = transcribedSpeech.toLowerCase();

        // Find a flashcard that matches the spoken title
        const matchedFlashcard = flashcards.find((flashcard) =>
          transcribedLower.includes(flashcard.title.toLowerCase())
        );

        if (matchedFlashcard) {
          handleNavigateToFlashcard(matchedFlashcard.id);
        } else {
          Speech.speak("Sorry, I didn't understand. Please try again.");
        }
        Speech.stop();
        setTranscribedSpeech(""); // Clear after handling the command
      };

      handleVoiceCommand();

      const timer = setTimeout(() => {
        setIsTranscriptionVisible(false);
        setTranscribedSpeech(""); // Clear after handling
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [transcribedSpeech]);

  // Navigate to FlashcardDetail page
  const handleNavigateToFlashcard = (flashcardId) => {
    navigation.navigate("CardsDetail", { flashcardId });
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flashcard List</Text>
      <FlatList
        data={flashcards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.flashcardItem}
            onPress={() => handleNavigateToFlashcard(item.id)}
          >
            <Text style={styles.flashcardTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Move the mic button to the bottom of the page */}
      <View style={styles.micWrapper}>
        <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
          <Ionicons
            name={isRecording ? "stop-circle" : "mic"}
            size={24}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 30,
    textAlign: "center",
    color: "#000080",
  },
  flashcardItem: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
  },
  flashcardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000080",
  },
  micWrapper: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: [{ translateX: -30 }], // Centers the button horizontally
  },
  micButton: {
    width: 60,
    height: 60,
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
  loader: {
    flex: 1,
    justifyContent: "center",
  },
});

export default FlashcardOverview;
