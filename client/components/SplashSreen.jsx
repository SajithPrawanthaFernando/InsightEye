import { useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Navigate to the login screen after 3 seconds
      navigation.replace("login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Ionicons
        name="eye"
        size={120}
        color="#000080"
        style={{ marginBottom: 20 }}
      />
      <Text style={styles.appName}>InsightEye</Text>
      <Text style={styles.tagline}>
        An Application for Visually{"\n"} Impaired Students
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // White background
  },
  appName: {
    fontSize: 52,
    fontWeight: "bold",
    color: "#000080", // Dark blue color for app name
    marginBottom: 50,
  },
  tagline: {
    fontSize: 24,
    color: "#555",
    textAlign: "center",
    lineHeight: 30,
  },
});

export default SplashScreen;
