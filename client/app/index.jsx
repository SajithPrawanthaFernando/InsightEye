import { useEffect, useRef, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../components/objectdetection/HomeScreen";
import ObjectDetectionScreen from "../components/objectdetection/ObjectDetectionScreen";
import ImageGalleryScreen from "../components/objectdetection/ImageGalleryScreen";
import ImageDetailScreen from "../components/objectdetection/ImageDetailScreen";
import EditImageScreen from "../components/objectdetection/EditImageScreen";
import ImageActionsScreen from "../components/objectdetection/ImageActionsScreen";
import MainScreen from "../components/MainScreen";
import { Audio } from "expo-av";
import { transcribeSpeech } from "@/functions/transcribeSpeech";

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
    <Stack.Navigator initialRouteName="Home">
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
    </Stack.Navigator>
  );
};

export default App;
