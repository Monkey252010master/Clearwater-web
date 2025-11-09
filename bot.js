// bot.js
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded IDs
const GUILD_ID = "1411784213795045518";       // Your guild ID
const STAFF_ROLE_ID = "1416789375529783329";  // Your staff role ID

// Discord bot setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // needed to fetch roles
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);

  // Custom status
  client.user.setPresence({
    status: "online",
    activities: [
      { name: "over Clearwater RP", type: 3 } // Watching
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
app.get("/dashboard", async (req, res) => {
  // For now, we’ll just demonstrate with a placeholder user ID.
  // Later, this will come from Discord login (OAuth2).
  const userId = "PUT_A_TEST_USER_ID_HERE";

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(userId);
    const isStaff = member.roles.cache.has(STAFF_ROLE_ID);

    if (isStaff) {
      res.send(`
        <h1>Staff Dashboard</h1>
        <p>Welcome, ${member.user.username}! You have staff access ✅</p>
      `);
    } else {
      res.send(`
        <h1>Access Denied</h1>
        <p>You do not have the staff role.</p>
      `);
    }
  } catch (err) {
    res.send("<h1>Error</h1><p>Could not fetch member info.</p>");
  }
});

// Start web server
app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// Login bot
client.login(process.env.DISCORD_TOKEN);
