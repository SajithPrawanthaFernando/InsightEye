import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Import icons from Expo

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleObjectDetectionPress = () => {
    navigation.navigate("ObjectDetection"); // Replace with your actual route name
  };

  const handleImageGalleryPress = () => {
    navigation.navigate("ImageGallery"); // Replace with your actual route name
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>
      <TouchableOpacity
        style={styles.card}
        onPress={handleObjectDetectionPress}
      >
        <Ionicons name="eye-outline" size={40} color="white" />
        <Text style={styles.cardTitle}>Object Detection</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={handleImageGalleryPress}>
        <Ionicons name="images-outline" size={40} color="white" />
        <Text style={styles.cardTitle}>Image Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.micButton}>
        <Ionicons name="mic" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 80,
    backgroundColor: "#f5f5f5", // Light background for better contrast
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000080", // Dark blue color for title
    marginBottom: 80,
  },
  card: {
    width: "80%",
    padding: 20,
    backgroundColor: "#000080", // Card color
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
    flexDirection: "column", // Arrange content vertically
    justifyContent: "center",
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10, // Add space between the icon and text
  },
  micButton: {
    position: "absolute",
    bottom: 20,
    width: 60,
    height: 60,
    marginBottom: 20,
    borderRadius: 30,
    backgroundColor: "#000080", // Dark blue background for the mic button
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
