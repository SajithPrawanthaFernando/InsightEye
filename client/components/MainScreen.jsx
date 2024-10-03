import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech"; // For text-to-speech
import { auth } from "../hooks/firebase";
import { signOut } from "firebase/auth";

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
  const route = useRoute();

  useEffect(() => {
    if (route.name === "Home") {
      // Only execute if on Home screen
      const welcomeMessage =
        "Welcome to InsightEye. For scheduling, say schedule. For object detection, say object detection. For science learning, say science. For maths learning, say maths. For logout, say logout";
      Speech.speak(welcomeMessage);

      return () => {
        Speech.stop();
        setTranscribedSpeech(""); // Clear speech when leaving
      };
    }
  }, [route.name]);

  useEffect(() => {
    if (route.name === "Home" && transcribedSpeech) {
      // Only respond to speech if we are on the Home Screenn
      setIsTranscriptionVisible(true);
      const handleNavigation = () => {
        if (transcribedSpeech.includes("schedule")) {
          navigation.navigate("ScheduleScreen");
        } else if (transcribedSpeech.includes("object detection")) {
          setTranscribedSpeech("");
          navigation.navigate("HomeScreen");
        } else if (transcribedSpeech.includes("science")) {
          navigation.navigate("StudentHome");
        } else if (transcribedSpeech.includes("maths")) {
          navigation.navigate("NoteScreen");
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
        setIsTranscriptionVisible(false);
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
      startRecording();
    }
    setIsTranscriptionVisible(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("login");
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>InsightEye</Text>

      <View style={styles.gridContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("ScheduleScreen")}
        >
          <Ionicons name="time-outline" size={40} color="white" />
          <Text style={styles.cardText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("HomeScreen")}
        >
          <Ionicons name="eye-outline" size={40} color="white" />
          <Text style={styles.cardText}>Object Detection</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("StudentHome")}
        >
          <Ionicons name="flask-outline" size={40} color="white" />
          <Text style={styles.cardText}>Science</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("NoteScreen")}
        >
          <Ionicons name="calculator-outline" size={40} color="white" />
          <Text style={styles.cardText}>Maths</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutcard} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
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
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 60,
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
  logoutcard: {
    width: 260,
    height: 60,
    backgroundColor: "#000080",
    borderRadius: 10,
    alignItems: "center", // Align items in the center vertically
    justifyContent: "space-between", // Align items starting from the left
    paddingHorizontal: 20, // Add some horizontal padding for spacing
    marginTop: 40,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: "row", // Set the direction to row
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 10, // Add space between icon and text
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
