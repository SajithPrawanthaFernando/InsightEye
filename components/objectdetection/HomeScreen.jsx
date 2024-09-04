import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

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
      <TouchableOpacity
        style={styles.card}
        onPress={handleObjectDetectionPress}
      >
        <Text style={styles.cardTitle}>Object Detection</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={handleImageGalleryPress}>
        <Text style={styles.cardTitle}>Image Gallery</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5", // Light background for better contrast
  },
  card: {
    width: "80%",
    padding: 20,
    backgroundColor: "#007BFF", // Card color
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default HomeScreen;
