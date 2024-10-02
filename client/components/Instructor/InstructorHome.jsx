import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../hooks/firebase";
import { signOut } from "firebase/auth";

const InstructorHome = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("login");
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Instructor Page</Text>

      <View style={styles.gridContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("ScheduleScreen")}
        >
          <Ionicons name="time-outline" size={40} color="white" />
          <Text style={styles.cardText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("ObjectReport")}
        >
          <Ionicons name="eye-outline" size={40} color="white" />
          <Text style={styles.cardText}>Object Detection</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("MainHome")}
        >
          <Ionicons name="flask-outline" size={40} color="white" />
          <Text style={styles.cardText}>Science</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("NoteScreen")}
        >
          <Ionicons name="calculator-outline" size={40} color="white" />
          <Text style={styles.cardText}>Maths</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutcard} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 80,
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000080",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 60,
  },
  card: {
    width: 120,
    height: 120,
    backgroundColor: "#000080",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: "column",
  },
  logoutcard: {
    width: 260,
    height: 60,
    backgroundColor: "#000080",
    borderRadius: 10,
    alignItems: "center", // Align items in the center vertically
    justifyContent: "space-between", // Align items starting from the left
    paddingHorizontal: 20, // Add some horizontal padding for spacing
    marginTop: 40,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: "row", // Set the direction to row
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 10, // Add space between icon and text
  },
  cardText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
  },
  micButton: {
    position: "absolute",
    bottom: 20,
    width: 60,
    height: 60,
    marginBottom: 20,
    borderRadius: 30,
    backgroundColor: "#000080",
    justifyContent: "center",
    alignItems: "center",
  },
  transcriptionContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transcriptionText: {
    fontSize: 16,
    color: "#000",
  },
});

export default InstructorHome;
