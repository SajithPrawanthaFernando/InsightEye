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
import ScheduleHome from "../components/scheduling/scheduleHome"; // Import the ScheduleHome component
import AddTasks from "../components/scheduling/addTasks"; // Import the AddTasks component
import TasksManagement from "../components/scheduling/tasksManagement"; // Import the TasksManagement component
import EditTask from "../components/scheduling/editTask.jsx"; // Import the EditTask component
const Stack = createStackNavigator();

const App = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={MainScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ObjectDetection"
        component={ObjectDetectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ImageGallery"
        component={ImageGalleryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ImageDetail"
        component={ImageDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditImage"
        component={EditImageScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ImageActions"
        component={ImageActionsScreen}
        options={{ title: "Object Detected" }}
        // Add the ImageActionsScreen to the stack
      />
      <Stack.Screen
        name="ScheduleHome"
        component={ScheduleHome}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddTasks"
        component={AddTasks}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TasksManagement"
        component={TasksManagement}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditTask"
        component={EditTask}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default App;
