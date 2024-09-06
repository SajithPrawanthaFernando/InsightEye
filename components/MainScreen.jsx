import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Import icons from Expo

const MainScreen = () => {
  const navigation = useNavigation();

  const handleHomeScreen = () => {
    navigation.navigate("HomeScreen"); // Replace with your actual route name
  };
  const handleScheduleScreen = () => {
    navigation.navigate("ScheduleHome"); // Replace with your actual route name
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>InsightEye</Text>

      <View style={styles.gridContainer}>
        <TouchableOpacity style={styles.card} onPress={handleScheduleScreen}>
          <Ionicons name="time-outline" size={60} color="white" />
          <Text style={styles.cardText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleHomeScreen}>
          <Ionicons name="eye-outline" size={60} color="white" />
          <Text style={styles.cardText}>Object Detection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={""}>
          <Ionicons name="flask-outline" size={60} color="white" />
          <Text style={styles.cardText}>Science</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={""}>
          <Ionicons name="calculator-outline" size={60} color="white" />
          <Text style={styles.cardText}>Maths</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.micButton}>
        <Ionicons name="mic" size={50} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 80,
    alignItems: "center", // Center the content horizontally
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000080", // Dark blue color for title
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 80,
  },
  card: {
    width: 170,
    height: 170,
    backgroundColor: "#000080", // Card color
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
    flexDirection: "column", // Arrange content vertically
  },
  cardText: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 10, // Space between icon and text
    textAlign: 'center',
  },
  micButton: {
    position: "absolute",
    bottom: 20,
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 100,
    backgroundColor: "#000080", // Dark blue background for the mic button
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MainScreen;
