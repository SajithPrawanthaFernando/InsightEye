import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { fetchSummary } from "../../hooks/apiConfig";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../hooks/firebase.jsx";
import { useRoute } from "@react-navigation/native"; // Use useRoute to get params

const FlashcardGenerator = () => {
  const route = useRoute(); // Use the route hook to access the noteId
  const { noteId } = route.params || {}; // Retrieve params from the route
  const [note, setNote] = useState({ title: "", description: "" });
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch the note data using the noteId from Firestore
    const fetchNote = async () => {
      if (!noteId) {
        Alert.alert("Error", "No note ID provided");
        return;
      }
      try {
        const docRef = doc(db, "sciencenotes", noteId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setNote(docSnap.data());
        } else {
          Alert.alert("Error", "Note not found");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load note");
      }
    };

    fetchNote();
  }, [noteId]);

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const generatedSummary = await fetchSummary(note.description);
      setSummary(generatedSummary);
    } catch (error) {
      Alert.alert("Error", "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFlashcard = async () => {
    if (!summary.trim()) {
      Alert.alert("Error", "No summary to save");
      return;
    }
    try {
      await addDoc(collection(db, "flashcards"), {
        title: note.title,
        summary,
        timestamp: new Date(),
      });
      Alert.alert("Success", "Flashcard saved successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to save flashcard");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={styles.container}
      >
        <Text style={styles.title}>Generate Flashcard</Text>

        <TextInput
          style={styles.input}
          placeholder="Note Title"
          value={note.title}
          editable={false}
        />

        <TextInput
          style={styles.textArea}
          placeholder="Note Description"
          value={note.description}
          editable={false}
          multiline
        />

        {loading && <Text style={styles.loadingText}>Loading...</Text>}

        {summary && (
          <View style={styles.flashcard}>
            <Text style={styles.flashcardTitle}>Flashcard Summary:</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.generateButton]}
            onPress={handleGenerateSummary}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Generating..." : "Generate Summary"}
            </Text>
          </TouchableOpacity>

          {summary && (
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSaveFlashcard}
            >
              <Text style={styles.buttonText}>Save Flashcard</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#000080",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
  },
  textArea: {
    height: 150,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    textAlignVertical: "top",
  },
  flashcard: {
    marginTop: 20,
    padding: 16,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#eaf4f4",
  },
  flashcardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#004d40",
  },
  summaryText: {
    fontSize: 16,
    color: "#004d40",
  },
  loadingText: {
    textAlign: "center",
    marginVertical: 10,
    color: "#00796b",
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#000080",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
});

export default FlashcardGenerator;
