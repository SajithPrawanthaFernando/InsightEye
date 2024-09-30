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
import LoginScreen from './app/screens/LoginScreen';
// Import your screen components
import NoteScreen from '../components/mathLesson/screens/noteScreen';
import NoteInputScreen from '../components/mathLesson/screens/noteInputModel';
import ViewNoteScreen from '../components/mathLesson/screens/ViewNoteScreen';
import EditNoteScreen from '../components/mathLesson/screens/EditNoteScreen';
import StudentLessonScreen from '../components/mathLesson/screens/StudentLessonScreen'; // Import StudentLessonScreen
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
       name="Login" 
       component={LoginScreen} />
        
        <Stack.Screen 
        name="StudentLessonScreen" 
        component={StudentLessonScreen} />
         
         <Stack.Screen name="NoteScreen" component={NoteScreen}  options={{ title: '' }}/>
         <Stack.Screen
           name="NoteInput"
           component={NoteInputScreen}
           options={{ title: '' }}
         />
         <Stack.Screen
           name="EditNoteScreen"
           component={EditNoteScreen}
           options={{ title: '' }}
         />
         <Stack.Screen
           name="ViewNoteScreen"
           component={ViewNoteScreen}
           options={{ title: '' }}
         />
       </Stack.Navigator>
 
  );
};

export default App;
