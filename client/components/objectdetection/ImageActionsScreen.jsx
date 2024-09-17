import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";

const ImageActionsScreen = ({
  startRecording,
  stopRecording,
  transcribedSpeech,
  isRecording,
  isTranscribing,
  setTranscribedSpeech,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    photoUri,
    geminiDescription,
    objectName,
    saveToFirebase,
    setPhotoUri,
  } = route.params;
  const [speaking, setSpeaking] = useState(false);
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);

  useEffect(() => {
    if (route.name === "ImageActions") {
      const welcomeMessage =
        "Welcome to the Image Actions Screen. You can say 'save to Firebase', 'cancel description', 'speak the description', or 'stop speaking'.";

      Speech.speak(welcomeMessage);

      return () => {
        Speech.stop();
        setTranscribedSpeech(""); // Clear when leaving
      };
    }
  }, [route.name]);

  useEffect(() => {
    if (transcribedSpeech) {
      setIsTranscriptionVisible(true);

      const handleVoiceInteraction = () => {
        const commandMatch = transcribedSpeech
          .toLowerCase()
          .match(
            /save to firebase|cancel description|speak the description|stop speaking/i
          );
        if (commandMatch) {
          switch (commandMatch[0]) {
            case "save to firebase":
              saveToFirebase();
              Speech.speak("Saving to Firebase.");
              break;
            case "cancel description":
              Speech.speak("Description cancelled.");
              handleImagePress();
              break;
            case "speak the description":
              speakDescription();
              break;
            case "stop speaking":
              stopSpeaking();
              break;
            default:
              Speech.speak("Sorry, I didn't understand. Please try again.");
              break;
          }
        } else {
          Speech.speak("Sorry, I didn't catch that command. Please try again.");
        }
      };

      handleVoiceInteraction();

      const timer = setTimeout(() => {
        setIsTranscriptionVisible(false);
        setTranscribedSpeech(""); // Clear transcription after processing
      }, 5000); // Set to 5 seconds for better user experience

      return () => clearTimeout(timer);
    }
  }, [transcribedSpeech]);

  const handleImagePress = () => {
    navigation.navigate("ObjectDetection");
    setPhotoUri(null);
  };

  const speakDescription = () => {
    if (geminiDescription) {
      Speech.speak(geminiDescription);
      setSpeaking(true);
    } else {
      alert("No description available to speak.");
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setSpeaking(false);
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
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.image} />
        <Text style={styles.objectName}>
          {objectName || "Object name : Loading ..."}
        </Text>
        <Text style={styles.description}>
          {geminiDescription || "Description : Loading ..."}
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity onPress={saveToFirebase} style={styles.button}>
            <Ionicons name="save-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleImagePress} style={styles.button}>
            <Ionicons name="close-circle-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={speakDescription} style={styles.button}>
            <Ionicons name="volume-high-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Speak Description</Text>
          </TouchableOpacity>

          {speaking && (
            <TouchableOpacity onPress={stopSpeaking} style={styles.stopButton}>
              <Ionicons name="stop-circle-outline" size={24} color="white" />
              <Text style={styles.buttonText}>Stop Speaking</Text>
            </TouchableOpacity>
          )}
        </View>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
    borderColor: "#000080",
    borderWidth: 2,
  },
  objectName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000080",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
    paddingHorizontal: 10,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000080",
    padding: 12,
    borderRadius: 8,
    margin: 5,
    justifyContent: "center",
    width: "45%",
  },
  stopButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF0000",
    padding: 12,
    borderRadius: 8,
    margin: 5,
    justifyContent: "center",
    width: "45%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#000080",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
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

export default ImageActionsScreen;
