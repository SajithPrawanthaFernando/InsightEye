import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Import icons from Expo
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import * as Speech from "expo-speech"; // For text-to-speech

const ScheduleHome = ({
  startRecording,
  stopRecording,
  transcribedSpeech,
  isRecording,
  isTranscribing,
  setTranscribedSpeech,
}) => {
  const navigation = useNavigation();
  const route = useRoute();

  const handleTaskManagementPress = () => {
    navigation.navigate("TasksManagement"); // Replace with your actual route name
  };
  const handleEmotionTrackerPress = () => {
    navigation.navigate("EmotionTracker"); // Replace with your actual route name
  };
  const handleHealthTrackerPress = () => {
    navigation.navigate("HealthTracker"); // Replace with your actual route name
  };

  useEffect(() => {
    if (route.name === "ScheduleHome" && transcribedSpeech) {
      // Only respond to speech if we are on the Home Screenn

      const handleNavigation = () => {
        if (transcribedSpeech.includes("task")) {
          navigation.navigate("TasksManagement");
        } else if (transcribedSpeech.includes("emotion")) {
          navigation.navigate("EmotionTracker");
        } else if (transcribedSpeech.includes("health")) {
          navigation.navigate("HealthTracker");
        } else if (transcribedSpeech.includes("log out")) {
          handleLogout();
          navigation.navigate("login");
        } else {
          Speech.speak("Sorry, I didn't understand. Please say it again.");
          Speech.stop();
          setTranscribedSpeech("");
        }
      };
      handleNavigation();

      const timer = setTimeout(() => {
        setTranscribedSpeech(""); // Clear after handling
      }, 1000);

      return () => clearTimeout(timer);
    }
    return () => {
      Speech.stop();
    };
  }, [transcribedSpeech, route.name]);

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setTranscribedSpeech(""); // Clear previous transcribed speech
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedules</Text>
      <TouchableOpacity style={styles.card} onPress={handleTaskManagementPress}>
        <FontAwesome5 name="tasks" size={40} color="white" />
        <Text style={styles.cardTitle}>Schedule Tasks</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={handleEmotionTrackerPress}>
        <FontAwesome5 name="meh-rolling-eyes" size={40} color="white" />
        <Text style={styles.cardTitle}>Emotion Tracker</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={handleHealthTrackerPress}>
        <FontAwesome5 name="heartbeat" size={40} color="white" />
        <Text style={styles.cardTitle}>Health Tracker</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
        <Ionicons
          name={isRecording ? "stop-circle" : "mic"}
          size={30}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f5f5f5", // Light background for better contrast
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000080", // Dark blue color for title
    marginBottom: 50,
    marginTop: 60,
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
  card: {
    width: "80%",
    padding: 20,
    backgroundColor: "#000080", // Card color
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
    flexDirection: "column", // Arrange content vertically
    justifyContent: "center",
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10, // Add space between the icon and text
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
});

export default ScheduleHome;
