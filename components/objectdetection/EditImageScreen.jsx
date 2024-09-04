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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            value={objectName}
            onChangeText={setObjectName}
            placeholder="Object Name"
          />
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            multiline
          />
          <TouchableOpacity onPress={handleSave} style={styles.button}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 20,
    padding: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});

export default EditImageScreen;
