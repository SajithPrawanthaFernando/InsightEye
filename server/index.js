const express = require("express");
const { speechToText } = require("./functions/speechToText");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const app = express();
app.use(express.json({ limit: "50mb" }));

// Cross-origin requests
app.use(cors());

app.post("/speech-to-text", (req, res) => {
  speechToText(req, res);
});

app.get("/", (req, res) => {
  res.send("The Speech-to-Text API is up and running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
