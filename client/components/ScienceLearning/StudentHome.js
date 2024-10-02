// app/StudentHome.js
import { useNavigation } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const StudentHome = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Home</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.push("NotesOverview");
        }}
      >
        <Text style={styles.buttonText}>Access Notes</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.push("FlashcardOverview");
        }}
      >
        <Text style={styles.buttonText}>Access Flashcards</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000080",
  },
  button: {
    backgroundColor: "#000080",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
  },
});

export default StudentHome;
