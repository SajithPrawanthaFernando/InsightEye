import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Button,
} from "react-native";
import { db } from "../../hooks/firebase";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import * as Print from "expo-print";
import * as Speech from "expo-speech"; // For text-to-speech functionality

const NoteScreen = ({
  navigation,
  startRecording,
  stopRecording,
  isRecording,
  transcribedSpeech,
  setTranscribedSpeech,
}) => {
  const [notes, setNotes] = useState([]);
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "notes"),
      (snapshot) => {
        const notesList = snapshot.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
        }));
        setNotes(notesList);
      },
      (error) => {
        Alert.alert("Error", "Could not fetch notes.");
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Trigger welcome message and instructions when the screen is first rendered
    Speech.speak("Welcome to the Math Lesson Notes.");
    Speech.speak(
      "You can add, view, or delete notes. To add a note, say 'add note'. To generate a report, say 'generate report'."
    );
  }, []);

  useEffect(() => {
    // Handle voice commands based on the transcribed speech
    if (transcribedSpeech) {
      const lowerCaseSpeech = transcribedSpeech.toLowerCase();

      if (lowerCaseSpeech.includes("add note")) {
        handleAddButtonPress();
      } else if (lowerCaseSpeech.includes("generate report")) {
        generatePDF();
      } else {
        Speech.speak("Sorry, I didn't understand the command.");
      }

      // Reset transcribed speech after handling
      setIsTranscriptionVisible(false);
      setTranscribedSpeech("");
    }
  }, [transcribedSpeech]);

  const handleAddButtonPress = () => {
    navigation.navigate("NoteInput", { isEditing: false });
  };

  const handleEditNote = (note) => {
    navigation.navigate("EditNoteScreen", { note });
  };

  const handleViewNote = (note) => {
    navigation.navigate("ViewNoteScreen", { note });
  };

  const handleDeleteNote = (noteId) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "notes", noteId));
            } catch (error) {
              Alert.alert("Error", "Could not delete the note.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const generatePDF = async () => {
    const htmlContent = `
      <h1>Math Report</h1>
      <h2>Lessons</h2>
      <ul>
        ${notes
          .map(
            (note) => `
          <li><strong>${note.title}</strong>: ${
              note.description || "No description"
            }</li>
        `
          )
          .join("")}
      </ul>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      Alert.alert("PDF Generated", `File saved to ${uri}`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Could not generate PDF.");
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    setIsTranscriptionVisible(true);
  };

  const renderNote = ({ item }) => (
    <View style={styles.noteContainer}>
      <View style={styles.noteTextContainer}>
        <Text style={styles.noteTitle}>{item.title}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => handleViewNote(item)}
          style={styles.iconButton}
        >
          <Icon name="eye" size={20} color="#000080" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleEditNote(item)}
          style={styles.iconButton}
        >
          <Icon name="edit" size={20} color="#000080" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteNote(item._id)}
          style={styles.iconButton}
        >
          <Icon name="trash" size={20} color="#ff4d4d" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Math Lesson</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddButtonPress}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={(item) => item._id}
      />
      <View style={styles.buttonWrapper}>
        <Button title="Generate Report" onPress={generatePDF} color="#000080" />
      </View>

      {/* Mic Button */}
      <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
        <Icon
          name={isRecording ? "stop-circle" : "microphone"}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      {isTranscriptionVisible && transcribedSpeech && (
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
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 0,
    textAlign: "center",
    color: "#000080",
  },
  addButton: {
    backgroundColor: "#000080",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  noteContainer: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteTextContainer: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginHorizontal: 5,
  },
  buttonWrapper: {
    marginVertical: 20,
  },
  micButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
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
  },
  transcriptionText: {
    fontSize: 16,
    color: "#000",
  },
});

export default NoteScreen;
