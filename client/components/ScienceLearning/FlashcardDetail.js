// app/FlashcardDetail.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../hooks/firebase.jsx";
import { translateToSinhala } from "../../hooks/apiConfig";
import { useRoute, useNavigation } from "@react-navigation/native";

const FlashcardDetail = () => {
  const [flashcard, setFlashcard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sinhalaSummary, setSinhalaSummary] = useState("");
  const route = useRoute();
  const navigation = useNavigation(); // To navigate back after deletion
  const { flashcardId } = route.params || {}; // Ensure flashcardId is defined

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

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "flashcards", flashcardId));
      navigation.goBack(); // Navigate back to the previous screen after deletion
    } catch (error) {
      console.error("Error deleting flashcard: ", error);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Flashcard",
      "Are you sure you want to delete this flashcard?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: handleDelete,
          style: "destructive", // iOS specific button style
        },
      ],
      { cancelable: true }
    );
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

        {/* Delete Button using TouchableOpacity */}
        <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
          <Text style={styles.deleteButtonText}>Delete Flashcard</Text>
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
  deleteButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: "#ff0000",
    borderRadius: 5,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FlashcardDetail;
