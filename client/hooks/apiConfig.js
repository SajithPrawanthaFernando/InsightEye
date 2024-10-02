// components/apiConfig.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';

const GEMINI_API_KEY = "AIzaSyD25FYd84iIDD1YpbX8jwuzsEKK-3j8Kp4"; // Replace with your Gemini API key

export const fetchSummary = async (text) => {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY); // Initialize GoogleGenerativeAI with API key
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Select the model

    const result = await model.generateContent(
      `Generate a concise summary for the following note: ${text}`
    ); // Generate content

    if (result.response.text()) {
      const cleanSummary = result.response.text().replace(/[#*]/g, ""); // Remove # and * from the summary
      return cleanSummary || "No summary returned";
    } else {
      return "No summary returned";
    }
  } catch (error) {
    console.error("Error fetching summary:", error);
    throw new Error("Failed to fetch summary");
  }
};

// Google Translate API
export const translateToSinhala = async (text) => {
  const API_KEY = "AIzaSyCDThI4gCG8Wtk4s_qlcFFOZWFciXutlnc"; // Replace with your API key
  const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

  try {
    const response = await axios.post(url, {
      q: text,
      target: "si", // "si" is the language code for Sinhala
    });

    const translatedText = response.data.data.translations[0].translatedText;
    return translatedText;
  } catch (error) {
    console.error("Error translating text: ", error);
    return text; // Fallback to original text in case of error
  }
};
