import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Button,
  TextInput,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import * as Speech from "expo-speech";
import { db, storage } from "../../hooks/firebase"; // Ensure your Firebase setup is imported
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import GoogleGenerativeAI

const CLARIFAI_PAT = "6f0772ff6e2940a0b7ca5c9c6aa0ca1c"; // Replace with your Clarifai Personal Access Token
const CLARIFAI_USER_ID = "obosl24w909z";
const CLARIFAI_APP_ID = "my_app";
const CLARIFAI_MODEL_ID = "general-image-detection";
const CLARIFAI_MODEL_VERSION_ID = "1580bb1932594c93b7e2e04456af7c6f";

const GEMINI_API_KEY = "AIzaSyCuyjc8dFcI7bbW-EpmZmggTRICLWmgqMI"; // Replace with your Gemini API Key

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

  const navigation = useNavigation();

  useEffect(() => {
    if (permission === null) {
      return;
    }

    if (!permission.granted) {
      return;
    }

    fetchImages();
  }, [permission]);

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: "100%",
    height: "70%",
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
    backgroundColor: "#2196F3",
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
});
