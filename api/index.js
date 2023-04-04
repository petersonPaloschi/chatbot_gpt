// Import required libraries
const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Initialize express app
const app = express();
app.use(bodyParser.json()); // Parse JSON request body
app.use(cors()); // Enable CORS for all routes

// Configure OpenAI API
const config = new Configuration({
  apiKey: process.env.API_TOKEN,
});
const openai = new OpenAIApi(config);

// Set up a welcome route
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

// Set up a message route for processing user input
app.post("/message", async (req, res) => 
{

  try 
  {
    // Send the user input to OpenAI API
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: req.body.message,
      temperature: 0,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 3000,
      stop: null,
    });

    // Process the response and send it back
    const message = { message: response.data.choices[0].text };
    res.status(200).send(message);

  } catch (err) {
    res.status(500).send(err);
  }

});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => console.log(`ouvindo http://${HOST}:${PORT}`));
