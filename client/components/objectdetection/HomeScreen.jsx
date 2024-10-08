import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";

const HomeScreen = ({
  startRecording,
  stopRecording,
  transcribedSpeech,
  isRecording,
  isTranscribing,
  setTranscribedSpeech,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);

  useEffect(() => {
    if (route.name === "HomeScreen") {
      const welcomeMessage =
        "Welcome to Explore. For object detection, say test object. For image gallery, say image gallery. For going back , say go back";

      Speech.speak(welcomeMessage);

      return () => {
        Speech.stop();
        setTranscribedSpeech(""); // Clear when leaving
      };
    }
  }, [route.name]);

  useEffect(() => {
    if (route.name === "HomeScreen" && transcribedSpeech) {
      setIsTranscriptionVisible(true);
      const handleNavigation = () => {
        if (transcribedSpeech.includes("test object")) {
          navigation.navigate("ObjectDetection");
        } else if (transcribedSpeech.includes("image gallery")) {
          navigation.navigate("ImageGallery");
        } else if (transcribedSpeech.includes("go back")) {
          navigation.navigate("Home");
        } else {
          Speech.speak("Sorry, I didn't understand. Please say it again.");
          setTranscribedSpeech("");
          Speech.stop();
        }
      };
      handleNavigation();

      const timer = setTimeout(() => {
        setIsTranscriptionVisible(false);
        setTranscribedSpeech("");
      }, 1000);

      return () => clearTimeout(timer);
    }
    return () => {
      Speech.stop();
    };
  }, [transcribedSpeech, route.name]);

  // Handle microphone button press
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
      <Text style={styles.title}>Explore</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("ObjectDetection")}
      >
        <Ionicons name="eye-outline" size={40} color="white" />
        <Text style={styles.cardTitle}>Object Detection</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("ImageGallery")}
      >
        <Ionicons name="images-outline" size={40} color="white" />
        <Text style={styles.cardTitle}>Image Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
        <Ionicons
          name={isRecording ? "stop-circle" : "mic"}
          size={30}
          color="white"
        />
      </TouchableOpacity>

      {isTranscribing && (
        <Text style={styles.transcribingText}>Transcribing...</Text>
      )}
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
    alignItems: "center",
    marginTop: 80,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000080",
    marginBottom: 80,
  },
  card: {
    width: "80%",
    padding: 20,
    backgroundColor: "#000080",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: "column",
    justifyContent: "center",
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  micButton: {
    position: "absolute",
    bottom: 20,
    width: 80,
    height: 80,
    marginBottom: 20,
    borderRadius: 100,
    backgroundColor: "#000080",
    justifyContent: "center",
    alignItems: "center",
  },
  transcribingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#000",
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

export default HomeScreen;
