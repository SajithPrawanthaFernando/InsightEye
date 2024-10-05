import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/AntDesign";

const ViewNoteScreen = ({ route, navigation }) => {
  const { note } = route.params;

  if (!note) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Note not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{note.title}</Text>
      <Text style={styles.content}>{note.content}</Text>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="closecircleo" size={20} color="#fff" />
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5", // Light background for consistency
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000080", // Dark blue color for titles
    marginBottom: 20,
    marginTop: 30,
    textAlign: "center",
  },
  content: {
    fontSize: 18,
    color: "#333", // Darker text for readability
    lineHeight: 24,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#000080", // Same blue used for other buttons
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row", // For icon and text alignment
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center", // Center the button at the bottom
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 10, // Space between the icon and text
  },
});

export default ViewNoteScreen;
