// bot.js
const { Client, GatewayIntentBits } = require("discord.js");

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ]
});

// When the bot is ready
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Simple command: reply to !ping
client.on("messageCreate", (message) => {
  if (message.content === "!ping") {
    message.reply("Pong! 🏓");
  }
});

// Login using your token (from Render env variable)
client.login(process.env.DISCORD_TOKEN);
