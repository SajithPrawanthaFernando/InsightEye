import { useEffect, useRef, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../components/objectdetection/HomeScreen";
import ObjectDetectionScreen from "../components/objectdetection/ObjectDetectionScreen";
import ImageGalleryScreen from "../components/objectdetection/ImageGalleryScreen";
import ImageDetailScreen from "../components/objectdetection/ImageDetailScreen";
import EditImageScreen from "../components/objectdetection/EditImageScreen";
import ImageActionsScreen from "../components/objectdetection/ImageActionsScreen";
import MainScreen from "../components/MainScreen";
import SplashScreen from "../components/SplashSreen";
import LoginPage from "../components/LoginPage";
import Profile from "../components/Profile";
import SignUpPage from "../components/SignUpPage";

import MainHome from "../components/ScienceLearning/MainHome";
import StudentHome from "../components/ScienceLearning/StudentHome";
import InstructorHome from "../components/ScienceLearning/InstructorHome";
import NotesOverview from "../components/ScienceLearning/NotesOverview";
import FlashcardOverview from "../components/ScienceLearning/FlashcardOverview";
import NoteDetail from "../components/ScienceLearning/NoteDetail";
import NoteUpdate from "../components/ScienceLearning/NoteUpdate";
import FlashcardGenerator from "../components/ScienceLearning/FlashcardGenerator";
import NoteCreation from "../components/ScienceLearning/NoteCreation";
import NoteList from "../components/ScienceLearning/NoteList";
import FlashcardList from "../components/ScienceLearning/FlashcardList";
import CardsDetail from "../components/ScienceLearning/CardsDetail";
import FlashcardDetail from "../components/ScienceLearning/FlashcardDetail";

import NoteScreen from "../components/mscreens/noteScreen";
import NoteInputScreen from "../components/mscreens/noteInputModel";
import ViewNoteScreen from "../components/mscreens/ViewNoteScreen";
import EditNoteScreen from "../components/mscreens/EditNoteScreen";
import StudentLessonScreen from "../components/mscreens/StudentLessonScreen"; // Ensure the correct path

import InstructorHomee from "../components/Instructor/InstructorHome";

import ObjectReport from "../components/Instructor/ObjectReport/ObjectReport";

import { Audio } from "expo-av";
import { transcribeSpeech } from "@/functions/transcribeSpeech";
// Import Firebase configurations
import { auth, db } from "../hooks/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getDoc, doc, setDoc } from "firebase/firestore";

import { recordSpeech } from "@/functions/recordSpeech";
import useWebFocus from "@/hooks/useWebFocus";

const Stack = createStackNavigator();

const App = () => {
  const [transcribedSpeech, setTranscribedSpeech] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const isWebFocused = useWebFocus();
  const audioRecordingRef = useRef(new Audio.Recording());
  const webAudioPermissionsRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchUserData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setUserData(userData);
    }
  };

  const handleAuthentication = async (navigation, currentPage) => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        navigation.navigate("Home");
      } else {
        if (currentPage === "login") {
          await signInWithEmailAndPassword(auth, email, password);
          console.log("User signed in successfully!");
          if (email == "instructor@gmail.com" && password == "instructor123") {
            navigation.navigate("InstructorHomee");
            setEmail("");
            setPassword("");
          } else {
            navigation.navigate("Home");
            setEmail("");
            setPassword("");
          }
        } else if (currentPage === "signup") {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          const user = userCredential.user;

          await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
          });

          console.log("User created successfully!");
          setName("");
          setEmail("");
          setPassword("");
          navigation.navigate("login");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error.message);
      Alert.alert("Authentication Error", error.message);
    }
  };

  useEffect(() => {
    if (isWebFocused) {
      const getMicAccess = async () => {
        const permissions = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        webAudioPermissionsRef.current = permissions;
      };
      if (!webAudioPermissionsRef.current) getMicAccess();
    } else {
      if (webAudioPermissionsRef.current) {
        webAudioPermissionsRef.current
          .getTracks()
          .forEach((track) => track.stop());
        webAudioPermissionsRef.current = null;
      }
    }
  }, [isWebFocused]);

  const startRecording = async () => {
    setIsRecording(true);
    await recordSpeech(
      audioRecordingRef,
      setIsRecording,
      !!webAudioPermissionsRef.current
    );
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      const speechTranscript = await transcribeSpeech(audioRecordingRef);
      setTranscribedSpeech(speechTranscript || "");
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen name="Splash" options={{ headerShown: false }}>
        {(props) => (
          <SplashScreen
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Home" options={{ headerShown: false }}>
        {(props) => (
          <MainScreen
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="signup" options={{ headerShown: false }}>
        {(props) => (
          <SignUpPage
            {...props}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleAuthentication={handleAuthentication}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="login" options={{ headerShown: false }}>
        {(props) => (
          <LoginPage
            {...props}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleAuthentication={handleAuthentication}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Profile" options={{ headerShown: false }}>
        {(props) => (
          <Profile
            {...props}
            user={user}
            handleAuthentication={handleAuthentication}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="HomeScreen" options={{ headerShown: false }}>
        {(props) => (
          <HomeScreen
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="ObjectDetection"
        options={{ headerShown: false }}
        component={ObjectDetectionScreen}
      />

      <Stack.Screen name="ImageGallery" options={{ headerShown: false }}>
        {(props) => (
          <ImageGalleryScreen
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ImageDetail" options={{ headerShown: false }}>
        {(props) => (
          <ImageDetailScreen
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="EditImage" options={{ headerShown: false }}>
        {(props) => (
          <EditImageScreen
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ImageActions" options={{ title: "Object Detected" }}>
        {(props) => (
          <ImageActionsScreen
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MainHome" options={{ headerShown: false }}>
        {(props) => (
          <MainHome
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="StudentHome" options={{ headerShown: false }}>
        {(props) => (
          <StudentHome
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="InstructorHome" options={{ headerShown: false }}>
        {(props) => (
          <InstructorHome
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="NotesOverview" options={{ headerShown: false }}>
        {(props) => (
          <NotesOverview
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="FlashcardOverview" options={{ headerShown: false }}>
        {(props) => (
          <FlashcardOverview
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="NoteDetail" options={{ headerShown: false }}>
        {(props) => (
          <NoteDetail
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="NoteUpdate" options={{ headerShown: false }}>
        {(props) => (
          <NoteUpdate
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="FlashcardGenerator" options={{ headerShown: false }}>
        {(props) => (
          <FlashcardGenerator
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="NoteCreation" options={{ headerShown: false }}>
        {(props) => (
          <NoteCreation
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="NoteList" options={{ headerShown: false }}>
        {(props) => (
          <NoteList
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="FlashcardList" options={{ headerShown: false }}>
        {(props) => (
          <FlashcardList
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CardsDetail" options={{ headerShown: false }}>
        {(props) => (
          <CardsDetail
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="FlashcardDetail" options={{ headerShown: false }}>
        {(props) => (
          <FlashcardDetail
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="StudentLessonScreen" options={{ headerShown: false }}>
        {(props) => (
          <StudentLessonScreen
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="NoteScreen" options={{ headerShown: false }}>
        {(props) => (
          <NoteScreen
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="NoteInput" options={{ title: "Add Lesson" }}>
        {(props) => (
          <NoteInputScreen
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="EditNoteScreen" options={{ headerShown: false }}>
        {(props) => (
          <EditNoteScreen
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ViewNoteScreen" options={{ headerShown: false }}>
        {(props) => (
          <ViewNoteScreen
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="InstructorHomee" options={{ headerShown: false }}>
        {(props) => (
          <InstructorHomee
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="ObjectReport" options={{ headerShown: false }}>
        {(props) => (
          <ObjectReport
            {...props}
            startRecording={startRecording}
            stopRecording={stopRecording}
            transcribedSpeech={transcribedSpeech}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            setTranscribedSpeech={setTranscribedSpeech}
            setIsRecording={setIsRecording}
            setIsTranscribing={setIsTranscribing}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default App;
