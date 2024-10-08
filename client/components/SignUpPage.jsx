import React, { useState, useEffect } from "react";
import {
  Dimensions,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const SignUpPage = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  handleAuthentication,
  transcribedSpeech,
  setTranscribedSpeech,
  startRecording,
  stopRecording,
  isRecording,
}) => {
  const navigation = useNavigation();
  const [error, setError] = useState("");

  // Voice instructions on page load
  useEffect(() => {
    const welcomeMessage =
      "Welcome to InsightEye Sign Up. Please say 'name' followed by your username, 'email' followed by your email address, 'password' followed by your password, 'sign up' to create an account, or 'sign in' to navigate to the login page.";
    Speech.speak(welcomeMessage);
    return () => {
      Speech.stop(); // Stop speaking when the component unmounts
    };
  }, []);

  // Handle voice input for name, email, password, sign up, and sign in
  useEffect(() => {
    if (transcribedSpeech) {
      const speechLower = transcribedSpeech.toLowerCase();

      if (speechLower.includes("name")) {
        const nameInput = speechLower.replace("name", "").trim();
        setName(nameInput);
        Speech.speak("Your username has been entered.");
      } else if (speechLower.includes("email")) {
        const emailInput = speechLower.replace("email", "").trim();
        setEmail(emailInput);
        Speech.speak("Your email has been entered.");
      } else if (speechLower.includes("password")) {
        const passwordInput = speechLower.replace("password", "").trim();
        setPassword(passwordInput);
        Speech.speak("Your password has been entered.");
      } else if (speechLower.includes("sign up")) {
        handleSignUp(); // Trigger the sign-up process
      } else if (speechLower.includes("sign in")) {
        navigation.navigate("login"); // Navigate to the login page
      } else {
        Speech.speak(
          "Please specify whether it's name, email, password, sign up, or sign in."
        );
      }
      setTranscribedSpeech(""); // Clear after handling
    }
  }, [transcribedSpeech]);

  const validateInput = () => {
    if (!name || !email || !password) {
      setError("All fields are required.");
      Speech.speak("Both fields are required.");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      Speech.speak("Please enter a valid email address.");
      return false;
    }
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

  const handleSignUp = async () => {
    if (!validateInput()) return;

    if (typeof handleAuthentication === "function") {
      await handleAuthentication(navigation, "signup"); // Pass current page as 'signup'
      navigation.navigate("Home");
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.logoText}>InsightEye</Text>
        <Text style={styles.subtitle}>Sign Up</Text>

        {/* Display error message if any */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your username"
            autoCapitalize="none"
            placeholderTextColor="#9ca3af"
          />
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

        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate("login")}
        >
          <Text style={styles.signUpButtonText}>Sign In</Text>
        </TouchableOpacity>

        {/* Mic Button for Voice Input */}
        <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
          <Ionicons
            name={isRecording ? "stop-circle" : "mic"}
            size={30}
            color={"white"}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    alignItems: "center",
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
    height: 60,
    color: "#000",
    paddingHorizontal: 15,
    borderRadius: 25,
    marginBottom: 15,
    borderColor: "#000080",
    borderWidth: 1,
  },
  signUpButton: {
    width: "100%",
    height: 70,
    backgroundColor: "#000080",
    padding: 21,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  micButton: {
    backgroundColor: "#000080",
    padding: 15,
    width: 80,
    height: 80,
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

export default SignUpPage;
