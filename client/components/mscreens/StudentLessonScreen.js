import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech"; // For text-to-speech
import { collection, getDocs } from "firebase/firestore"; // For fetching data from Firestore
import { db } from "../../hooks/firebase"; // Firebase configuration

const StudentLessonScreen = (props) => {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    startRecording,
    stopRecording,
    transcribedSpeech,
    isTranscribing,
    setTranscribedSpeech,
    isRecording,
  } = props;

  // Fetch notes from Firestore
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "notes"));
        const fetchedNotes = [];
        querySnapshot.forEach((doc) => {
          fetchedNotes.push({ id: doc.id, ...doc.data() });
        });
        setNotes(fetchedNotes);
      } catch (error) {
        console.error("Error fetching notes: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  // Play welcome message when the screen is loaded
  useEffect(() => {
    if (!loading) {
      Speech.speak(
        "Welcome to your maths lesson screen. You can say Lesson 1, Lesson 2, or similar commands to navigate."
      );
    }
  }, [loading]);

  // Handle voice commands after transcribing speech
  useEffect(() => {
    if (transcribedSpeech) {
      handleVoiceCommand(transcribedSpeech);
    }
  }, [transcribedSpeech]);

  // Handle voice command navigation
  const handleVoiceCommand = (command) => {
    const lessonNumber = command.match(/\d+/); // Extract the lesson number from the command
    if (lessonNumber) {
      const selectedNote = notes[parseInt(lessonNumber[0]) - 1]; // Find the corresponding note
      if (selectedNote) {
        setActiveNote(selectedNote); // Set the active note
        Speech.speak(
          `You have selected ${selectedNote.title}. Now starting the lesson.`
        );

        // Speak the lesson content
        Speech.speak(`${selectedNote.title}. ${selectedNote.content}`);
        setTranscribedSpeech(""); // Clear the transcription after navigating
      } else {
        Speech.speak("Sorry, I couldn't find that lesson.");
      }
    } else {
      Speech.speak("Please say a valid lesson number.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000080" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Maths Lesson{"\n"}Screen</Text>

      {activeNote ? (
        <View style={styles.scrollContainer}>
          <ScrollView contentContainerStyle={styles.lessonContainer}>
            <Text style={styles.lessonTitle}>{activeNote.title}</Text>
            <Text style={styles.lessonContent}>{activeNote.content}</Text>
          </ScrollView>
        </View>
      ) : (
        notes.map((note, index) => (
          <TouchableOpacity
            key={note.id}
            style={styles.card}
            onPress={() => {
              setActiveNote(note);
              Speech.speak(`You have selected ${note.title}.`);
            }}
          >
            <Text style={styles.cardTitle}>{`Lesson ${index + 1}: ${
              note.title
            }`}</Text>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity
        style={styles.micButton}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Ionicons
          name={isRecording ? "stop-circle" : "mic"}
          size={30}
          color="white"
        />
      </TouchableOpacity>

      {isTranscribing && (
        <Text style={styles.transcribingText}>Transcribing...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure container takes the full available height
    alignItems: "center",

    padding: 16,
  },
  scrollContainer: {
    height: "78%", // Adjust ScrollView container to be 70% of the screen height
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginTop: 30,
    fontSize: 30,
    fontWeight: "bold",
    color: "#000080",
    textAlign: "center",
    marginBottom: 20,
  },
  lessonContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    width: "100%",
    elevation: 3,
    marginBottom: 30,
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
  },
  lessonContent: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#000080",
    borderRadius: 8,
    padding: 20,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
    elevation: 2,
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  micButton: {
    backgroundColor: "#000080",
    width: 80,
    height: 80,
    padding: 15,
    marginTop: 250,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  transcribingText: {
    fontSize: 16,
    color: "#FF4500",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#000080",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default StudentLessonScreen;
