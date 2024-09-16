const axios = require("axios");
require("dotenv").config();

const speechToText = async (req, res) => {
  const data = req.body;
  const audioUrl = data?.audioUrl;
  const audioConfig = data?.config;

  if (!audioUrl) return res.status(422).send("No audio URL was provided.");
  if (!audioConfig)
    return res.status(422).send("No audio config was provided.");

  try {
    const response = await axios.post(
      "https://speech.googleapis.com/v1/speech:recognize",
      {
        audio: {
          content: audioUrl,
        },
        config: audioConfig,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GOOGLE_SPEECH_TO_TEXT_API_KEY,
        },
      }
    );

    return res.send(response.data);
  } catch (err) {
    console.error("Error converting speech to text: ", err);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = { speechToText };
