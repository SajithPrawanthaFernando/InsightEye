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
import { Audio } from "expo-av";
import { transcribeSpeech } from "@/functions/transcribeSpeech";
 // Ensure the correct path
 import NoteScreen from '../components/mscreens/noteScreen';
 import NoteInputScreen from '../components/mscreens/noteInputModel';
 import ViewNoteScreen from '../components/mscreens/ViewNoteScreen';
 import EditNoteScreen from '../components/mscreens/EditNoteScreen';
 import StudentLessonScreen from '../components/mscreens/StudentLessonScreen'; // Ensure the correct path
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
          navigation.navigate("Home");
          setEmail("");
          setPassword("");
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
      {/* {(props) => (
          <ObjectDetectionScreen
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
      </Stack.Screen> */}
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
      <Stack.Screen name="StudentLessonScreen" component={StudentLessonScreen}options={{ title: '' }} />
        
        <Stack.Screen name="NoteScreen" component={NoteScreen}  options={{ title: '' }}/>
        <Stack.Screen
          name="NoteInput"
          component={NoteInputScreen}
          options={{ title: 'Add Lesson' }}
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
