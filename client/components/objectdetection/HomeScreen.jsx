import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = ({
  startRecording,
  stopRecording,
  transcribedSpeech,
  isRecording,
  isTranscribing,
}) => {
  const navigation = useNavigation();
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);

  useEffect(() => {
    if (transcribedSpeech) {
      setIsTranscriptionVisible(true);

      // Hide transcription after 5 seconds
      const timer = setTimeout(() => {
        setIsTranscriptionVisible(false);
      }, 3000);

      // Clear the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [transcribedSpeech]);

  const handleObjectDetectionPress = () => {
    navigation.navigate("ObjectDetection");
  };

  const handleImageGalleryPress = () => {
    navigation.navigate("ImageGallery");
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={handleObjectDetectionPress}
      >
        <Ionicons name="eye-outline" size={40} color="white" />
        <Text style={styles.cardTitle}>Object Detection</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={handleImageGalleryPress}>
        <Ionicons name="images-outline" size={40} color="white" />
        <Text style={styles.cardTitle}>Image Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
        <Ionicons
          name={isRecording ? "stop-circle" : "mic"}
          size={24}
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
    width: 60,
    height: 60,
    marginBottom: 20,
    borderRadius: 30,
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
