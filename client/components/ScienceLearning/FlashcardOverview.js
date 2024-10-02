// app/FlashcardOverview.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../hooks/firebase";
import { useNavigation, useRouter } from "expo-router";

const FlashcardOverview = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "flashcards"));
        const flashcardArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFlashcards(flashcardArray);
      } catch (error) {
        console.error("Error fetching flashcards: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#000080" style={styles.loader} />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flashcard List</Text>
      <FlatList
        data={flashcards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.flashcardItem}
            onPress={() =>
              navigation.navigate("CardsDetail", { flashcardId: item.id })
            }
          >
            <Text style={styles.flashcardTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#000080",
  },
  flashcardItem: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
  },
  flashcardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000080",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
});

export default FlashcardOverview;
