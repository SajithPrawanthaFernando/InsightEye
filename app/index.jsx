import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../components/objectdetection/HomeScreen"; // Adjust the path as needed
import ObjectDetectionScreen from "../components/objectdetection/ObjectDetectionScreen"; // Your object detection screen
import ImageGalleryScreen from "../components/objectdetection/ImageGalleryScreen"; // Your image gallery screen
import ImageDetailScreen from "../components/objectdetection/ImageDetailScreen"; // Optional: If you have this screen
import EditImageScreen from "../components/objectdetection/EditImageScreen";
import ImageActionsScreen from "../components/objectdetection/ImageActionsScreen"; // Import the new ImageActionsScreen
import MainScreen from "../components/MainScreen";

const Stack = createStackNavigator();

const App = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={MainScreen}
        options={{ title: "Welcome to InsightEye!" }}
      />
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: "Explore!" }}
      />
      <Stack.Screen
        name="ObjectDetection"
        component={ObjectDetectionScreen}
        options={{ title: "Object Detection" }}
      />
      <Stack.Screen
        name="ImageGallery"
        component={ImageGalleryScreen}
        options={{ title: "Image Gallery" }}
      />
      <Stack.Screen
        name="ImageDetail"
        component={ImageDetailScreen}
        options={{ title: "Image Detail" }}
      />
      <Stack.Screen
        name="EditImage"
        component={EditImageScreen}
        options={{ title: "Edit Image" }}
      />
      <Stack.Screen
        name="ImageActions"
        component={ImageActionsScreen} // Add the ImageActionsScreen to the stack
        options={{ title: "Image Actions" }} // Optionally, set the title
      />
    </Stack.Navigator>
  );
};

export default App;
