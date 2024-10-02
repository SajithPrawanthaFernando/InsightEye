import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { db } from "../../hooks/firebase";

const EditImageScreen = ({
  startRecording,
  stopRecording,
  transcribedSpeech,
  isRecording,
  isTranscribing,
  setTranscribedSpeech,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;
  const [objectName, setObjectName] = useState(item.objectName);
  const [description, setDescription] = useState(item.description);
  const [errors, setErrors] = useState({ objectName: "", description: "" });
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);
  const [editingField, setEditingField] = useState("");

  useEffect(() => {
    const welcomeMessage =
      "Welcome to the edit screen. You can change the object name and description. Say save description to save, back to go back, edit name to edit the object name, or edit description to edit the description.";
    Speech.speak(welcomeMessage);

    return () => {
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    if (transcribedSpeech && route.name === "EditImage") {
      setIsTranscriptionVisible(true);

      const handleVoiceInteraction = () => {
        const commandMatch = transcribedSpeech
          .toLowerCase()
          .match(/edit name|edit description|save description|go back/i);

        if (commandMatch) {
          switch (commandMatch[0]) {
            case "edit name":
              setEditingField("objectName");
              Speech.speak("Please say your new object name.");
              break;
            case "edit description":
              setEditingField("description");
              Speech.speak("Please say your new description.");
              break;
            case "save description":
              handleSave();
              break;
            case "go back":
              navigation.goBack();
              break;
            default:
              Speech.speak(
                "Sorry, I didn't understand the command. Please try again."
              );
              break;
          }
        }
      };

      handleVoiceInteraction();

      const timer = setTimeout(() => {
        setIsTranscriptionVisible(false);
        setTranscribedSpeech(""); // Clear transcription after processing
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [transcribedSpeech, route.name, navigation, setTranscribedSpeech]);

  useEffect(() => {
    if (transcribedSpeech && editingField) {
      if (editingField === "objectName") {
        setObjectName((prevName) => prevName + " " + transcribedSpeech);
      } else if (editingField === "description") {
        setDescription((prevDesc) => prevDesc + " " + transcribedSpeech);
      }
      setTranscribedSpeech(""); // Clear transcription after appending
      setEditingField(""); // Reset editing field
    }
  }, [transcribedSpeech, editingField, setTranscribedSpeech]);

  const handleObjectNameChange = (text) => {
    const containsNumber = /\d/;
    const containsSpecialChar = /[^a-zA-Z0-9\s]/;

    if (containsNumber.test(text)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        objectName: "Object name cannot contain numbers.",
      }));
    } else if (text === "") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        objectName: "Object name is required.",
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, objectName: "" }));
      setObjectName(text);
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

  const handleDescriptionChange = (text) => {
    if (text === "") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        description: "Description is required.",
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, description: "" }));
      setDescription(text);
    }
  };

  const handleSave = async () => {
    if (!objectName) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        objectName: "Object name is required.",
      }));
    }
    if (!description) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        description: "Description is required.",
      }));
    }

    if (errors.objectName || errors.description) {
      Alert.alert("Validation Error", "Please fix the errors before saving.");
      return;
    }

    try {
      await db.collection("objects").doc(item.id).update({
        objectName,
        description,
      });
      Alert.alert("Success", "Description updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating description:", error);
      Alert.alert("Error", "Failed to update description.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Edit Image Details</Text>

        <Text style={styles.inputtext}>Object Name</Text>
        <TextInput
          style={styles.input}
          value={objectName}
          onChangeText={handleObjectNameChange}
          placeholder="Object Name"
          placeholderTextColor="#000080"
        />
        {errors.objectName ? (
          <Text style={styles.errorText}>{errors.objectName}</Text>
        ) : null}

        <Text style={styles.inputtext}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={handleDescriptionChange}
          placeholder="Description"
          placeholderTextColor="#000080"
          multiline
        />
        {errors.description ? (
          <Text style={styles.errorText}>{errors.description}</Text>
        ) : null}

        <TouchableOpacity onPress={handleSave} style={styles.button}>
          <Ionicons name="save-outline" size={24} color="white" />
          <Text style={styles.buttonText}>Save</Text>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    height: "140%",
  },
  title: {
    marginTop: 60,
    fontSize: 30,
    fontWeight: "bold",
    color: "#000080",
    marginBottom: 20,
    textAlign: "center",
  },
  inputtext: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: "#000080",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: 280,
    borderColor: "#000080",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000080",
    marginBottom: 20,
    backgroundColor: "#ffffff",
  },
  textArea: {
    width: 280,
    height: "40%",
    textAlignVertical: "top",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000080",
    padding: 15,
    width: 140,
    borderRadius: 8,
    marginTop: 20,
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 10,
  },
  micButton: {
    marginTop: 40,
    bottom: 20,
    width: 60,
    height: 60,
    marginBottom: 10,
    borderRadius: 30,
    backgroundColor: "#000080",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  transcribingText: {
    fontSize: 16,
    color: "#000",
  },
  transcriptionContainer: {
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

export default EditImageScreen;
