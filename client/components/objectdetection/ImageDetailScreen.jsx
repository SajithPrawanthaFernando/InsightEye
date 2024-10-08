import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { db, storage } from "../../hooks/firebase";

const ImageDetailScreen = ({
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
  const [speaking, setSpeaking] = useState(false);
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);

  useEffect(() => {
    if (route.name === "ImageDetail") {
      const welcomeMessage = `Welcome to the details of ${item.objectName}. To edit the image, say "edit." To delete the image, say "delete." To hear the description, say "speak description." To stop hearing the description, say "stop.`;
      Speech.speak(welcomeMessage);
    }

    // Cleanup function to stop speech when navigating away
    return () => {
      Speech.stop();
    };
  }, [route.name, item.objectName]);

  useEffect(() => {
    if (transcribedSpeech) {
      setIsTranscriptionVisible(true);

      const handleVoiceInteraction = () => {
        const commandMatch = transcribedSpeech
          .toLowerCase()
          .match(/edit|delete|speak description|stop/i);
        if (commandMatch) {
          switch (commandMatch[0]) {
            case "edit":
              handleEdit();
              break;
            case "delete":
              handleDelete();
              break;
            case "speak description":
              speakDescription();
              break;
            case "stop":
              stopSpeaking();
              break;
            default:
              Speech.speak("Sorry, I didn't understand. Please try again.");
              Speech.stop();
              setTranscribedSpeech("");
              break;
          }
        } else {
          Speech.speak("Sorry, I didn't catch that command. Please try again.");
          Speech.stop();
          setTranscribedSpeech("");
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

  const handleEdit = () => {
    navigation.navigate("EditImage", { item });
  };

  const handleDelete = async () => {
    try {
      await db.collection("objects").doc(item.id).delete();
      const ref = storage.refFromURL(item.imageUrl);
      await ref.delete();
      Alert.alert("Success", "Item deleted successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert("Error", "Failed to delete item.");
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

  const speakDescription = () => {
    if (item.description) {
      Speech.speak(item.description);
      setSpeaking(true);
    } else {
      Alert.alert("No Description", "No description available to speak.");
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setSpeaking(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Image Details</Text>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
            <Ionicons name="create-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.objectName}>{item.objectName}</Text>
        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            onPress={speakDescription}
            style={styles.speakButton}
          >
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
            size={30}
            color="white"
          />
        </TouchableOpacity>

        {isTranscribing && (
          <Text style={{ marginTop: 5 }}>Transcribing...</Text>
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
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000080",
    marginBottom: 20,
  },
  imageContainer: {
    width: 150,
    height: 150,
    backgroundColor: "#ccccff",
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "50%",
    marginVertical: 10,
  },
  iconButton: {
    backgroundColor: "#000080",
    padding: 10,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    borderRadius: 50,
  },
  objectName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000080",
    marginTop: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#000080",
    marginBottom: 20,
    textAlign: "center",
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 100,
    backgroundColor: "#000080",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
  },
  speakButton: {
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

export default ImageDetailScreen;
