import React, { useState } from "react";
import {
  View,
  Image,
  Button,
  StyleSheet,
  Text,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Speech from "expo-speech";

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

  const speakDescription = () => {
    if (geminiDescription) {
      Speech.speak(geminiDescription);
      setSpeaking(true); // Set speaking state to true
    } else {
      alert("No description available to speak.");
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setSpeaking(false); // Set speaking state to false
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.image} />
        {/* Display the object name */}
        <Text style={styles.objectName}>
          {objectName || "Object name : Loading ..."}
        </Text>
        {/* Display the description */}
        <Text style={styles.description}>
          {geminiDescription || "Description : Loading ..."}
        </Text>
        <Button title="Save" onPress={saveToFirebase} />
        <Button title="Cancel" onPress={() => setPhotoUri(null)} />
        <Button title="Speak Description" onPress={speakDescription} />
        {speaking && <Button title="Stop Speaking" onPress={stopSpeaking} />}
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
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  objectName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
});

export default ImageActionsScreen;
