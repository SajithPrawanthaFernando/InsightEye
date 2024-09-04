import React, { useState } from "react";
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
import { Ionicons } from "@expo/vector-icons"; // Import icons from Expo
import { db } from "../../hooks/firebase"; // Ensure your Firebase setup is imported

const EditImageScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;

  const [objectName, setObjectName] = useState(item.objectName);
  const [description, setDescription] = useState(item.description);

  const handleSave = async () => {
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
      <Text style={styles.title}>Edit Image Details</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.inputtext}>Object Name</Text>
        <TextInput
          style={styles.input}
          value={objectName}
          onChangeText={setObjectName}
          placeholder="Object Name"
          placeholderTextColor="#000080" // Dark blue placeholder text color
        />
        <Text style={styles.inputtext}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          placeholderTextColor="#000080" // Dark blue placeholder text color
          multiline
        />

        <TouchableOpacity onPress={handleSave} style={styles.button}>
          <Ionicons name="save-outline" size={24} color="white" />
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.micButton}>
          <Ionicons name="mic" size={24} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    height: "110%",
  },
  title: {
    marginTop: 60,
    fontSize: 30,
    fontWeight: "bold",
    color: "#000080", // Dark blue color for title
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
    borderColor: "#000080", // Dark blue border
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000080", // Dark blue input text color
    marginBottom: 20,
    backgroundColor: "#ffffff", // White background for input fields
  },
  textArea: {
    width: 280,
    height: "40%",
    textAlignVertical: "top", // For multiline input alignment
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000080", // Dark blue background for the button
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
    position: "absolute",
    bottom: 20,
    width: 60,
    height: 60,
    marginBottom: 10,
    borderRadius: 30,
    backgroundColor: "#000080", // Dark blue background for the mic button
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditImageScreen;
