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
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <Text style={styles.objectName}>{item.objectName}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.button}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.button}>
          <Text style={styles.buttonText}>Delete</Text>
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
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  objectName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default ImageDetailScreen;
