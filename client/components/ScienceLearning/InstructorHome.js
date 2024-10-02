// app/InstructorHome.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Home = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate("NoteCreation");
        }}
      >
        <Ionicons name="create-outline" size={40} color="white" />
        <Text style={styles.cardTitle}>Note Creation</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate("NoteList");
        }}
      >
        <Ionicons name="list-outline" size={40} color="white" />
        <Text style={styles.cardTitle}>Note List</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate("FlashcardList");
        }}
      >
        <Ionicons name="book-outline" size={40} color="white" />
        <Text style={styles.cardTitle}>Flashcard List</Text>
      </TouchableOpacity>
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
    marginTop: 80, // Adjusted marginTop to reduce space above the title
    marginBottom: 80,
  },
  card: {
    width: "80%",
    padding: 20,
    backgroundColor: "#000080",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: "column",
    justifyContent: "center",
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
});

export default Home;
