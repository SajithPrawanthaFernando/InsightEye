import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../hooks/firebase"; // Ensure your Firebase setup is imported
import { Ionicons } from "@expo/vector-icons"; // Import icons from Expo

const ImageGalleryScreen = () => {
  const [images, setImages] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchImages();
  }, []);

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
        numColumns={2} // Display images in a 2x2 grid
        renderItem={renderGridItem}
        contentContainerStyle={styles.grid}
      />
      <TouchableOpacity style={styles.micButton}>
        <Ionicons name="mic" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center", // Center the content horizontally
    justifyContent: "center", // Center the content vertically
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000080", // Dark blue color for title
    marginTop: 80,
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
    backgroundColor: "#c0c0c0", // Placeholder color for images
  },
  micButton: {
    position: "absolute",
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#000080", // Dark blue background for the mic button
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
});

export default ImageGalleryScreen;
