import React, { useState } from "react";
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

const ImageActionsScreen = () => {
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
        <TouchableOpacity style={styles.micButton}>
          <Ionicons name="mic" size={24} color="white" />
        </TouchableOpacity>
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
});

export default ImageActionsScreen;
