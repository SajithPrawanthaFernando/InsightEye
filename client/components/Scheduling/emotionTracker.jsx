import React, { useEffect, useState, useRef } from "react"; // Import useRef
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";

export default function EmotionTracker({
  startRecording,
  stopRecording,
  transcribedSpeech,
  isRecording,
  setTranscribedSpeech,
  setIsRecording,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    setIsRecording(false);
  }, []);

  // URL for the Gemini API
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDKPiJ0QAFCm0qpydBNa9oegvIOzmTvj0U";

  const scrollViewRef = useRef(null); // Create a reference for ScrollView

  const speak = (textToSpeak) => {
    Speech.speak(textToSpeak);
  };
  useEffect(() => {
    const welcomeMessage =
      "Welcome to the Emotional Tracker. You can say things like, 'I feel happy', 'I feel sad'.";
    Speech.speak(welcomeMessage);

    return () => {
      Speech.stop();
      setTranscribedSpeech(""); // Clear speech when leaving
    };
  }, []);

  useEffect(() => {
    if (transcribedSpeech.trim()) {
      handleSend(transcribedSpeech);
      setTranscribedSpeech(""); // Clear transcribed speech after processing
    }
  }, [transcribedSpeech]);

  useEffect(() => {
    // Scroll to the bottom when messages change
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]); // Depend on messages state

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      Speech.stop();
      startRecording();
    }
  };

  // Function to check if the message is related to emotions
  const checkEmotionRelated = async (userMessage) => {
    const body = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Is this message related to emotions? if it is please respond "yes" if not respond "no" no any other words! Message: "${userMessage}"`,
            },
          ],
        },
      ],
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text
        ?.trim()
        .toLowerCase();

      return aiResponse === "yes";
    } catch (error) {
      console.error("Error checking if the message is emotion-related:", error);
      return false;
    }
  };

  // Function to call Gemini API to generate response
  const generateEmotionResponse = async (userMessage) => {
    const body = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Provide a brief and supportive response to a partially blind child expressing sadness or happiness. Include a short, encouraging tip to help cheer them up or reinforce their positive feelings. Message: "${userMessage}"`,
            },
          ],
        },
      ],
    });

    try {
      setLoading(true);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
      const data = await response.json();
      const aiResponse =
        data.candidates[0]?.content?.parts[0]?.text || "No response from AI";

      // Add AI response to the messages list
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: aiResponse },
      ]);
      speak(aiResponse);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle sending a message
  const handleSend = async (userMessage) => {
    const newMessage = { role: "user", content: userMessage };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    if (transcribedSpeech.includes("back")) {
      navigation.goBack();

      return;
    }

    const isEmotionRelated = await checkEmotionRelated(userMessage);
    if (isEmotionRelated) {
      await generateEmotionResponse(userMessage);
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "Please provide emotion-related things.",
        },
      ]);
      speak("Please provide emotion-related things.");
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View>
          <Text style={styles.title}>Emotion Tracker</Text>
        </View>
        {messages.length > 0 ? (
          <View style={styles.messageContainer}>
            <View style={styles.messageBox}>
              <ScrollView
                ref={scrollViewRef} // Attach the ref to the ScrollView
                bounces={false}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((message, index) => {
                  if (message.role === "assistant") {
                    return (
                      <View key={index} style={styles.assistantMessage}>
                        <View style={styles.assistantBubble}>
                          <Text>{message.content}</Text>
                        </View>
                      </View>
                    );
                  } else {
                    return (
                      <View key={index} style={styles.userMessage}>
                        <View style={styles.userBubble}>
                          <Text>{message.content}</Text>
                        </View>
                      </View>
                    );
                  }
                })}
              </ScrollView>
            </View>
          </View>
        ) : null}
        <View style={styles.micButtonContainer}>
          <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
            <Ionicons
              name={isRecording ? "stop-circle" : "mic"}
              size={30}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  safeArea: {
    flex: 1,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000080",
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },

  messageContainer: {
    flex: 1,
    marginBottom: 20,
  },
  assistantText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000080",
    marginBottom: 20,
  },
  messageBox: {
    height: 600,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  micButtonContainer: {
    position: "absolute", // Make it fixed to the bottom
    bottom: 30, // Adjust for desired position
    left: "50%",
    transform: [{ translateX: -30 }], // Center horizontally
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 100,
    backgroundColor: "#000080",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    marginVertical: 8,
  },
  assistantMessage: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingBottom: 16,
    paddingTop: 16,
  },
  assistantBubble: {
    width: 280,
    backgroundColor: "#BFDBFE",
    borderRadius: 20,
    padding: 16,
    borderTopRightRadius: 0,
  },
  userMessage: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingBottom: 16,
    paddingTop: 16,
  },
  userBubble: {
    width: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderTopRightRadius: 0,
  },
});
