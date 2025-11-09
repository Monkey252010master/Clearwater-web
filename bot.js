// Import required libraries
const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const fetch = require("node-fetch");

const app = express();

// --------------------
// Discord Bot Setup
// --------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Commands
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  // !ping
  if (message.content === "!ping") {
    message.reply("🏓 Pong!");
  }

  // !status
  if (message.content === "!status") {
    (async () => {
      try {
        const response = await fetch("https://api.policeroleplay.community/v1/server/players", {
          headers: { "Server-Key": process.env.ERLC_API_KEY }
        });

        if (!response.ok) {
          // Show exact error in Discord
          message.reply(`⚠️ ERLC API error: ${response.status} ${response.statusText}`);
          return;
        }

        const data = await response.json();
        const playerCount = data.players ? data.players.length : 0;

        message.reply(`📊 Current player count: ${playerCount}`);
      } catch (err) {
        console.error(err);
        // Show exact error in Discord
        message.reply(`⚠️ Error fetching player count: ${err.message}`);
      }
    })();
  }
});

// Login using environment variable
client.login(process.env.DISCORD_TOKEN);

// --------------------
// ER:LC Status API (for website)
// --------------------
app.get("/status", async (req, res) => {
  try {
    const response = await fetch("https://api.policeroleplay.community/v1/server/players", {
      headers: { "Server-Key": process.env.ERLC_API_KEY }
    });

    if (!response.ok) throw new Error("ERLC API error");

    const data = await response.json();
    const playerCount = data.players ? data.players.length : 0;

    res.json({
      players: playerCount,
      sessionActive: true
    });
  } catch (err) {
    console.error(err);
    // Website only shows "error"
    res.json({ error: "error" });
  }
});

// --------------------
// Web Service Listener
// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 API running on port ${PORT}`));
