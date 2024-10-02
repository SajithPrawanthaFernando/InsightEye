import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av"; // Importing Audio for recording
import * as Speech from "expo-speech"; // For text-to-speech

const lessons = [
  { id: 1, title: "Lesson 1: Introduction to Math", content: "In this lesson, we will cover the basics of addition, subtraction, multiplication, and division." },
  { id: 2, title: "Lesson 2: Advanced Algebra", content: "In this lesson, we will explore polynomial equations." },
  { id: 3, title: "Lesson 3: Geometry Basics", content: "In this lesson, we will learn about shapes and angles." },
];

const StudentLessonScreen = () => {
  const navigation = useNavigation();
  const [activeLesson, setActiveLesson] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedSpeech, setTranscribedSpeech] = useState("");
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);

  useEffect(() => {
    const welcomeMessage = "Welcome to your lessons. Please say 'Lesson 1', 'Lesson 2', or 'Lesson 3' to begin.";
    Speech.speak(welcomeMessage);
  }, []);

  const startRecording = async () => {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    console.log("Stopping recording..");
    setIsTranscribing(true);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); // Get the URI of the recorded audio
    console.log("Recording stopped and stored at", uri);

    // Send the recording for transcription
    await sendRecordingForTranscription(uri);
  };

  const sendRecordingForTranscription = async (uri) => {
    try {
      const response = await fetch('YOUR_TRANSCRIPTION_API_ENDPOINT', {
        method: 'POST',
        body: JSON.stringify({
          audio: uri,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.transcript) {
        setTranscribedSpeech(result.transcript);
      } else {
        console.error("No transcript found", result);
      }
    } catch (error) {
      console.error("Error sending audio for transcription", error);
    } finally {
      setIsTranscribing(false);
      setIsTranscriptionVisible(true);
    }
  };

  const handleMicPress = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Lessons</Text>

      {/* Display active lesson */}
      {activeLesson ? (
        <View style={styles.lessonContainer}>
          <Text style={styles.lessonTitle}>{activeLesson.title}</Text>
          <Text style={styles.lessonContent}>{activeLesson.content}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => Speech.speak("Now starting " + activeLesson.title)}
          >
            <Text style={styles.buttonText}>Start Lesson</Text>
          </TouchableOpacity>
        </View>
      ) : (
        lessons.map((lesson) => (
          <TouchableOpacity
            key={lesson.id}
            style={styles.card}
            onPress={() => {
              setActiveLesson(lesson);
              Speech.speak(`You have selected ${lesson.title}.`);
            }}
          >
            <Text style={styles.cardTitle}>{lesson.title}</Text>
          </TouchableOpacity>
        ))
      )}

      {/* Mic Button for Voice Input */}
      <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
        <Ionicons
          name={recording ? "stop-circle" : "mic"}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      {isTranscribing && (
        <Text style={styles.transcribingText}>Transcribing...</Text>
      )}
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  lessonContainer: {
    marginBottom: 40,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  lessonContent: {
    fontSize: 16,
    marginVertical: 10,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#4682B4",
    borderRadius: 8,
    padding: 20,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
  },
  micButton: {
    marginTop: 30,
    backgroundColor: "#000080",
    padding: 20,
    borderRadius: 50,
  },
  transcribingText: {
    fontSize: 16,
    color: "#FFA500",
    marginTop: 10,
  },
  transcriptionContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transcriptionText: {
    fontSize: 16,
    color: "#000",
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#4682B4",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default StudentLessonScreen;
