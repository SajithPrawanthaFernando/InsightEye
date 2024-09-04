import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Import icons from Expo
import { db, storage } from "../../hooks/firebase"; // Ensure your Firebase setup is imported

const ImageDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;

  const handleEdit = () => {
    navigation.navigate("EditImage", { item });
  };

  const handleDelete = async () => {
    try {
      await db.collection("objects").doc(item.id).delete();
      const ref = storage.refFromURL(item.imageUrl);
      await ref.delete();
      Alert.alert("Success", "Item deleted successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert("Error", "Failed to delete item.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Image Details</Text>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
            <Ionicons name="create-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.objectName}>{item.objectName}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <TouchableOpacity style={styles.micButton}>
          <Ionicons name="mic" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000080", // Dark blue color for title
    marginBottom: 20,
  },
  imageContainer: {
    width: 150,
    height: 150,
    backgroundColor: "#ccccff", // Light blue placeholder color
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "50%",
    marginVertical: 10,
  },
  iconButton: {
    backgroundColor: "#000080", // Dark blue background for icons
    padding: 10,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    borderRadius: 50,
  },
  objectName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000080",
    marginTop: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#000080",
    marginBottom: 20,
    textAlign: "center",
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#000080", // Dark blue background for the mic button
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
});

export default ImageDetailScreen;
