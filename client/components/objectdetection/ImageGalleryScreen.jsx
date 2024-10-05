import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db, auth } from "../../hooks/firebase";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";

const ImageGalleryScreen = ({
  startRecording,
  stopRecording,
  transcribedSpeech,
  isRecording,
  isTranscribing,
  setTranscribedSpeech,
}) => {
  const [images, setImages] = useState([]);
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const navigation = useNavigation();
  const route = useRoute();

  // Fetch images when the screen is loaded
  useEffect(() => {
    if (route.name === "ImageGallery") {
      fetchImages();
    }

    return () => {
      Speech.stop(); // Stop any ongoing speech when unmounting
    };
  }, [route.name]);

  // Create and speak the welcome message
  useEffect(() => {
    if (images.length > 0) {
      // Construct the base welcome message
      let message = `Welcome to the detected objects gallery. There are ${images.length} images. To select an image, say the image number.`;

      // Add image descriptions
      images.forEach((image, index) => {
        const imageDescription = image.objectName || `Image ${index + 1}`;
        message += ` Image ${index + 1} is ${imageDescription}.`;
      });

      setWelcomeMessage(message);
      Speech.speak(message);
    }
  }, [images]);

  // Handle voice input and image selection
  useEffect(() => {
    if (route.name === "ImageGallery" && transcribedSpeech) {
      setIsTranscriptionVisible(true);

      // Handle voice navigation based on the recognized number
      const handleVoiceNavigation = () => {
        const numberMatch = transcribedSpeech.match(/number (\d+)|(\d+)/i);
        if (numberMatch) {
          const imageNumber = parseInt(numberMatch[1] || numberMatch[2], 10);
          if (imageNumber > 0 && imageNumber <= images.length) {
            const selectedImage = images[imageNumber - 1];
            navigation.navigate("ImageDetail", { item: selectedImage });
          } else if (transcribedSpeech.includes("go back")) {
            navigation.navigate("HomeScreen");
          } else {
            Speech.speak(
              "Sorry, I didn't understand. Please say a valid image number."
            );
          }
        }
      };

      handleVoiceNavigation();

      // Clear transcription after processing
      const timer = setTimeout(() => {
        setIsTranscriptionVisible(false);
        setTranscribedSpeech(""); // Reset transcription after use
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [transcribedSpeech, images, route.name]);

  // Fetch images from Firestore that belong to the current user
  const fetchImages = async () => {
    try {
      // Replace `currentUserId` with the actual user ID, possibly from Firebase Auth
      const currentUserId = auth.currentUser.uid;

      const snapshot = await db
        .collection("objects")
        .where("userId", "==", currentUserId) // Fetch images where userId matches the current user
        .get();

      const fetchedImages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setImages(fetchedImages);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  // Handle microphone press for voice interaction
  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    setIsTranscriptionVisible(true);
  };

  // Navigate to image detail on image press
  const handleImagePress = (item) => {
    navigation.navigate("ImageDetail", { item });
  };

  const renderGridItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => handleImagePress(item)}>
      <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
      <Text style={styles.imageNumber}>{index + 1}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detected Objects</Text>
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderGridItem}
        contentContainerStyle={styles.grid}
      />

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
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000080",
    marginTop: 60,
    marginBottom: 60,
  },
  grid: {
    flexGrow: 1,
  },
  thumbnail: {
    width: 140,
    height: 140,
    margin: 12,
    borderRadius: 8,
    backgroundColor: "#c0c0c0",
  },
  imageNumber: {
    position: "absolute",
    bottom: 5,
    right: 10,
    color: "white",
    fontSize: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 2,
    borderRadius: 5,
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
    marginBottom: 120,
    fontSize: 16,
    color: "#000",
  },
  transcriptionContainer: {
    marginTop: 20,
    marginBottom: 120,
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

export default ImageGalleryScreen;
