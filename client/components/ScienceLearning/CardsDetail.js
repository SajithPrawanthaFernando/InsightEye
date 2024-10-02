// app/CardsDetail.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../hooks/firebase.jsx";
import { translateToSinhala } from "../../hooks/apiConfig";
import { useRoute } from "@react-navigation/native";
import * as Speech from "expo-speech"; // Import Speech API

const CardsDetail = () => {
  const [flashcard, setFlashcard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sinhalaSummary, setSinhalaSummary] = useState("");

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
        }
      } catch (error) {
        console.error("Error fetching flashcard: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (flashcardId) {
      fetchFlashcard();
    }
  }, [flashcardId]);

  const handleReadEnglish = () => {
    // Speak the flashcard title and summary in English
    Speech.speak(`${flashcard.title}. ${flashcard.summary}`, {
      language: "en", // Specify English language
    });
  };

  const handleReadSinhala = () => {
    // Speak the flashcard title and summary in Sinhala
    Speech.speak(`${flashcard.title}. ${sinhalaSummary}`, {
      language: "si", // Specify Sinhala language
    });
  };

  const handleStopReading = () => {
    // Stop any ongoing speech
    Speech.stop();
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
  },
  stopButton: {
    backgroundColor: "#FF0000", // Red color for the stop button
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default CardsDetail;
