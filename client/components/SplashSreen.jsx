import { useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, ImageBackground } from "react-native";

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Navigate to the main screen after 3 seconds
      navigation.replace("login"); // Replace with your main screen's name
    }, 3000); // Set to 3 seconds

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>InsightEye</Text>
      <Text style={styles.tagline}>
        A Application for Visually{"\n"} Imapired Students
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover", // Ensures the image covers the screen
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 176,
    height: 158,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1434A4", // Blue color for app name
  },
  tagline: {
    fontSize: 18,
    color: "#555",
    alignItems: "center",
  },
});

export default SplashScreen;
