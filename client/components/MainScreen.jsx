import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const MainScreen = ({
  startRecording,
  stopRecording,
  transcribedSpeech,
  isRecording,
  isTranscribing,
  setTranscribedSpeech,
}) => {
  const navigation = useNavigation();
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);

  useEffect(() => {
    if (transcribedSpeech) {
      setIsTranscriptionVisible(true);

      // Hide transcription after 5 seconds
      const timer = setTimeout(() => {
        setIsTranscriptionVisible(false);
        setTranscribedSpeech("");
      }, 3000);

      // Clear the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [transcribedSpeech]);

  const handleHomeScreen = () => {
    navigation.navigate("HomeScreen");
  };

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
      <Text style={styles.title}>InsightEye</Text>

      <View style={styles.gridContainer}>
        <TouchableOpacity style={styles.card} onPress={""}>
          <Ionicons name="time-outline" size={40} color="white" />
          <Text style={styles.cardText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={handleHomeScreen}>
          <Ionicons name="eye-outline" size={40} color="white" />
          <Text style={styles.cardText}>Object Detection</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={""}>
          <Ionicons name="flask-outline" size={40} color="white" />
          <Text style={styles.cardText}>Science</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={""}>
          <Ionicons name="calculator-outline" size={40} color="white" />
          <Text style={styles.cardText}>Maths</Text>
        </TouchableOpacity>

        {/* Add more cards if needed */}
      </View>

      <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
        <Ionicons
          name={isRecording ? "stop-circle" : "mic"}
          size={24}
          color="white"
        />
      </TouchableOpacity>

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
    marginTop: 80,
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000080",
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 80,
  },
  card: {
    width: 120,
    height: 120,
    backgroundColor: "#000080",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: "column",
  },
  cardText: {
    color: "#ffffff",
    fontSize: 14,
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

export default MainScreen;
