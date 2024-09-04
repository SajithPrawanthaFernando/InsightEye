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
import { db } from "../../hooks/firebase"; // Ensure your Firebase setup is imported

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

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleImagePress(item)}>
            <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  thumbnail: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
});

export default ImageGalleryScreen;
