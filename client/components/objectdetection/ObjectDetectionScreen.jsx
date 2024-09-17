import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { db, storage } from "../../hooks/firebase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { transcribeSpeech } from "../../functions/transcribeSpeech";

import { recordSpeech } from "../../functions/recordSpeech";
import useWebFocus from "../../hooks/useWebFocus";

const CLARIFAI_PAT = "6f0772ff6e2940a0b7ca5c9c6aa0ca1c";
const CLARIFAI_USER_ID = "obosl24w909z";
const CLARIFAI_APP_ID = "my_app";
const CLARIFAI_MODEL_ID = "general-image-detection";
const CLARIFAI_MODEL_VERSION_ID = "1580bb1932594c93b7e2e04456af7c6f";

const GEMINI_API_KEY = "AIzaSyCuyjc8dFcI7bbW-EpmZmggTRICLWmgqMI";

export default function ObjectDetectionScreen() {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [clarifaiPredictions, setClarifaiPredictions] = useState([]);
  const [geminiDescription, setGeminiDescription] = useState("");
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [objectName, setObjectName] = useState("");
  const [images, setImages] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);
  const [transcribedSpeech, setTranscribedSpeech] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const isWebFocused = useWebFocus();
  const audioRecordingRef = useRef(new Audio.Recording());
  const webAudioPermissionsRef = useRef(null);

  const navigation = useNavigation();

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

  useEffect(() => {
    if (transcribedSpeech) {
      setIsTranscriptionVisible(true);

      // Hide transcription after 5 seconds
      const timer = setTimeout(() => {
        setIsTranscriptionVisible(false);
        setTranscribedSpeech("");
      }, 3000);

      // Clear the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [transcribedSpeech]);

  useEffect(() => {
    if (permission === null) {
      return;
    }

    if (!permission.granted) {
      return;
    }

    fetchImages();
  }, [permission]);

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    setIsTranscriptionVisible(true);
  };

  const fetchImages = async () => {
    try {
      const snapshot = await db.collection("objects").get();
      const fetchedImages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setImages(fetchedImages);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const takePicture = async () => {
    if (cameraRef) {
      try {
        let photo = await cameraRef.takePictureAsync();
        setPhotoUri(photo.uri);
        await processImage(photo.uri);
      } catch (err) {
        console.error("Error taking picture:", err);
        setError("Failed to take picture.");
      }
    }
  };

  const processImage = async (uri) => {
    try {
      const { base64 } = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { height: 300, width: 300 } }],
        { base64: true }
      );

      // Process image with Clarifai
      const clarifaiRaw = JSON.stringify({
        user_app_id: {
          user_id: CLARIFAI_USER_ID,
          app_id: CLARIFAI_APP_ID,
        },
        inputs: [
          {
            data: {
              image: {
                base64: base64,
              },
            },
          },
        ],
      });

      const clarifaiResponse = await fetch(
        `https://api.clarifai.com/v2/models/${CLARIFAI_MODEL_ID}/versions/${CLARIFAI_MODEL_VERSION_ID}/outputs`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Key ${CLARIFAI_PAT}`,
            "Content-Type": "application/json",
          },
          body: clarifaiRaw,
        }
      );

      const clarifaiResult = await clarifaiResponse.json();

      if (
        clarifaiResult &&
        clarifaiResult.outputs &&
        clarifaiResult.outputs[0] &&
        clarifaiResult.outputs[0].data &&
        clarifaiResult.outputs[0].data.regions
      ) {
        const detectedObjects = clarifaiResult.outputs[0].data.regions.map(
          (region) => ({
            name: region.data.concepts
              .map((concept) => concept.name)
              .join(", "),
            value: region.data.concepts
              .map((concept) => concept.value.toFixed(4))
              .join(", "),
          })
        );
        setClarifaiPredictions(detectedObjects);

        // Extract detected object names to get descriptions
        const objectNames = detectedObjects.map((obj) => obj.name).join(", ");
        await getGeminiDescription(objectNames);
        setObjectName(objectNames);
      } else {
        setError("No objects detected by Clarifai.");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      setError("Failed to process image.");
    }
  };

  const getGeminiDescription = async (objectNames) => {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY); // Initialize GoogleGenerativeAI with API key
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Select the model

      const result = await model.generateContent(
        `Describe these objects: ${objectNames}`
      ); // Generate content

      if (result.response.text()) {
        const cleanDescription = result.response.text().replace(/[#*]/g, ""); // Remove # and * from the description
        setGeminiDescription(cleanDescription);
      } else {
        setError("No description returned from Gemini.");
      }
    } catch (error) {
      console.error("Error getting Gemini description:", error);
      setError("Failed to get description from Gemini.");
    }
  };

  const saveToFirebase = async () => {
    if (geminiDescription && photoUri) {
      try {
        const imageUrl = await uploadImageToFirebase(photoUri);
        await db.collection("objects").add({
          description: geminiDescription,
          objectName: objectName,
          imageUrl: imageUrl,
          createdAt: new Date(),
        });
        alert("Description and image saved to Firebase!");
        setPhotoUri(null);
        setObjectName("");
        setGeminiDescription("");
        fetchImages();
      } catch (error) {
        console.error("Error saving description:", error);
      }
    } else {
      alert("Description or image is missing. Please provide both.");
    }
  };

  const uploadImageToFirebase = async (imageUri) => {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const fileName = imageUri.substring(imageUri.lastIndexOf("/") + 1);
    const ref = storage.ref().child(fileName);
    await ref.put(blob);
    return await ref.getDownloadURL();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Object Detection</Text>
      {permission && permission.granted ? (
        photoUri ? (
          navigation.navigate("ImageActions", {
            photoUri,
            geminiDescription,
            objectName,
            saveToFirebase,
            setPhotoUri,
          })
        ) : (
          <>
            <CameraView style={styles.camera} type={facing} ref={setCameraRef}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={takePicture}>
                  <Text style={styles.buttonText}>Take Photo</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          </>
        )
      ) : (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera permission is required to use this app.
          </Text>
          <Button title="Grant Permission" onPress={requestPermission} />
        </View>
      )}

      <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
        <Ionicons
          name={isRecording ? "stop-circle" : "mic"}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      {isTranscribing && (
        <Text style={styles.transcribingText}>Transcribing...</Text>
      )}
      {isTranscriptionVisible && !isTranscribing && transcribedSpeech && (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionText}>{transcribedSpeech}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000080",
    marginBottom: 30,
    marginTop: 30,
  },
  camera: {
    width: "100%",
    height: "68%",
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    margin: 20,
  },
  button: {
    flex: 1,
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#000080",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
  },
  image: {
    width: 150,
    height: 150,
    margin: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  itemText: {
    fontSize: 14,
    marginLeft: 10,
  },
  selectedItem: {
    borderColor: "blue",
    borderWidth: 2,
  },
  permissionContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 20,
  },
  micButton: {
    position: "absolute",
    bottom: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#000080",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 7,
  },
  transcribingText: {
    marginTop: 5,
    fontSize: 16,
    color: "#000",
  },
  transcriptionContainer: {
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
