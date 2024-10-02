import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import * as Speech from "expo-speech"; // For text-to-speech
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // For the mic icon

const instructorEmail = "instructor@gmail.com"; // Hardcoded instructor email
const instructorPassword = "instructor123"; // Hardcoded instructor password

const LoginPage = ({
  startRecording,
  stopRecording,
  transcribedSpeech,
  isRecording,
  isTranscribing,
  setTranscribedSpeech,
  email,
  setEmail,
  password,
  setPassword,
  handleAuthentication,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const navigation = useNavigation();
  const [error, setError] = useState("");

  // Voice instructions for normal users only, not instructors
  useEffect(() => {
    const welcomeMessage =
      "Welcome to InsightEye login. Please say 'email' followed by your email address, 'password' followed by your password, 'login' to proceed, or 'sign up' to create a new account.";
    Speech.speak(welcomeMessage);
    return () => {
      Speech.stop(); // Stop speaking when the component unmounts
    };
  }, []);

  const validateInput = () => {
    if (!email || !password) {
      setError("Both fields are required.");
      Speech.speak("Both fields are required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      Speech.speak("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      Speech.speak("Password must be at least 6 characters long.");
      return false;
    }
    setError("");
    return true;
  };

  const handleLogin = async () => {
    if (!validateInput()) return;

    // Instructor Login
    if (email === instructorEmail && password === instructorPassword) {
      Speech.speak("Instructor login successful.");
      navigation.navigate("NoteScreen"); // Navigate to Lesson Screen for instructor
      return;
    }

    // Normal user authentication (assuming you have a handleAuthentication function)
    if (typeof handleAuthentication === "function") {
      await handleAuthentication(navigation, "login");
      Speech.speak("Login successful.");
    } else {
      console.error("handleAuthentication is not a function");
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View
      style={[styles.container, { width: windowWidth, height: windowHeight }]}
    >
      <Text style={styles.logoText}>InsightEye</Text>
      <Text style={styles.subtitle}>Login</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          autoCapitalize="none"
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          placeholderTextColor="#9ca3af"
        />
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Sign-Up Button */}
      <TouchableOpacity
        style={[styles.loginButton, { backgroundColor: "#000080", marginTop: 10 }]}
        onPress={() => navigation.navigate("signup")}
      >
        <Text style={styles.loginButtonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Mic Button for Voice Input */}
      <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
        <Ionicons
          name={isRecording ? "stop-circle" : "mic"}
          size={50}
          color={"white"}
        />
      </TouchableOpacity>

      {isTranscribing && <Text>Transcribing...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 23,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000080",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  inputContainer: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 24,
    color: "#000",
    marginBottom: 5,
  },
  input: {
    height: 80,
    color: "#000",
    paddingHorizontal: 15,
    borderRadius: 25,
    marginBottom: 15,
    borderColor: "#000080",
    borderWidth: 1,
  },
  loginButton: {
    width: "100%",
    height: 70,
    backgroundColor: "#000080",
    padding: 21,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  micButton: {
    backgroundColor: "#000080",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  errorText: {
    color: "red",
    marginBottom: 20,
  },
});

export default LoginPage;

