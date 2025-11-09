// bot.js
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded IDs
const GUILD_ID = "1411784213795045518";
const STAFF_ROLE_ID = "1416789375529783329";

// Discord bot setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  client.user.setPresence({
    status: "online",
    activities: [{ name: "over Clearwater RP", type: 3 }]
  });
});

// Simple command
client.on("messageCreate", (message) => {
  if (message.content === "!ping") {
    message.reply("Pong! 🏓");
  }
});

// Session setup
app.use(
  session({
    secret: "super-secret", // replace with a random string
    resave: false,
    saveUninitialized: false
  })
);

// Passport setup
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_REDIRECT_URI,
      scope: ["identify"]
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/auth/discord", passport.authenticate("discord"));
app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

app.get("/dashboard", async (req, res) => {
  if (!req.user) {
    return res.send(`
      <h1>Staff Dashboard</h1>
      <p>You must log in with Discord.</p>
      <a href="/auth/discord">Log in with Discord</a>
    `);
  }

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(req.user.id);
    const isStaff = member.roles.cache.has(STAFF_ROLE_ID);

    if (isStaff) {
      res.send(`
        <h1>Staff Dashboard</h1>
        <p>Welcome, ${req.user.username}! ✅</p>
      `);
    } else {
      res.send("<h1>Access Denied</h1><p>You are not staff.</p>");
    }
  } catch (err) {
    res.send("<h1>Error</h1><p>Could not fetch member info.</p>");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// Login bot
client.login(process.env.DISCORD_TOKEN);
