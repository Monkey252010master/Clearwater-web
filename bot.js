// bot.js
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Discord bot setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);

  // Custom status
  client.user.setPresence({
    status: "online", // green dot
    activities: [
      {
        name: "over Clearwater RP", // 👀 custom message
        type: 3 // Watching
      }
    ]
  });
});

// Simple command
client.on("messageCreate", (message) => {
  if (message.content === "!ping") {
    message.reply("Pong! 🏓");
  }
});

// Staff dashboard route
app.get("/dashboard", (req, res) => {
  res.send(`
    <h1>Staff Dashboard</h1>
    <p>This is a placeholder page. Later we'll add Discord login + role checks.</p>
  `);
});

// Start web server
app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// Login bot
client.login(process.env.DISCORD_TOKEN);
