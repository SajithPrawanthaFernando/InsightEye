import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../hooks/firebase";
import { Ionicons } from "@expo/vector-icons";

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
  const navigation = useNavigation();

  useEffect(() => {
    fetchImages();
  }, []);

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

  const fetchImages = async () => {
    try {
      const snapshot = await db.collection("objects").get();
      const fetchedImages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setImages(fetchedImages);
    } catch (error) {
      console.error("Error fetching images:", error);
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

  const handleImagePress = (item) => {
    navigation.navigate("ImageDetail", { item });
  };

  const renderGridItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleImagePress(item)}>
      <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
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
