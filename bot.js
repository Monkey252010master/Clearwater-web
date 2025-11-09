// Import required libraries
const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const fetch = require("node-fetch");

const app = express();

// --------------------
// Discord Bot Setup
// --------------------
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Login with token stored in Render environment variables
client.login(process.env.DISCORD_TOKEN);

// --------------------
// ER:LC Status API
// --------------------
app.get("/status", async (req, res) => {
  try {
    const response = await fetch("https://api.policeroleplay.community/v1/server/players", {
      headers: { "Server-Key": process.env.ERLC_API_KEY }
    });

    if (!response.ok) throw new Error("ERLC API error: " + response.status);

    const data = await response.json();
    const playerCount = data.players ? data.players.length : 0;

    res.json({
      players: playerCount,
      sessionActive: false // you can later toggle this with another env var
    });
  } catch (err) {
    console.error(err);
    res.json({ players: 0, sessionActive: false });
  }
});

// --------------------
// Web Service Listener
// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 API running on port ${PORT}`));
