// bot.js
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded guild and staff role IDs
const GUILD_ID = "1411784213795045518";
const STAFF_ROLE_ID = "1416789375529783329";

// Session setup
app.use(
  session({
    secret: "replace-with-a-long-random-string",
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
      const user = {
        id: profile.id,
        username: profile.username,
        avatar: profile.avatar
      };
      return done(null, user);
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());

// Discord bot
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

client.on("messageCreate", (message) => {
  if (message.content === "!ping") {
    message.reply("Pong! 🏓");
  }
});

// Auth routes
app.get("/auth/discord", passport.authenticate("discord"));

app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req, res) => {
    // After login, send them back to homepage
    res.redirect("/");
  }
);

app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
});

// Helpers
async function userIsStaff(userId) {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(userId);
    return member.roles.cache.has(STAFF_ROLE_ID);
  } catch {
    return false;
  }
}

// Homepage
app.get("/", (req, res) => {
  const loggedIn = req.user ? true : false;
  res.send(`
    <h1>Clearwater RP Homepage</h1>
    <p>Welcome to the site.</p>
    ${
      loggedIn
        ? `<p>Logged in as ${req.user.username} | <a href="/auth/logout">Log out</a></p>`
        : `<a href="/auth/discord">Log in with Discord</a>`
    }
    <p><a href="/dashboard">Go to Staff Dashboard</a></p>
  `);
});

// Staff dashboard (protected)
app.get("/dashboard", async (req, res) => {
  if (!req.user) {
    return res.send(`
      <h1>Staff Dashboard</h1>
      <p>You must log in with Discord.</p>
      <a href="/auth/discord">Log in with Discord</a>
    `);
  }

  const isStaff = await userIsStaff(req.user.id);
  if (!isStaff) {
    return res.status(403).send(`
      <h1>Access Denied</h1>
      <p>Your account is not marked as staff.</p>
      <p><a href="/auth/logout">Log out</a></p>
    `);
  }

  res.send(`
    <h1>Staff Dashboard</h1>
    <p>Welcome, ${req.user.username}! ✅ Staff verified.</p>
    <p><a href="/auth/logout">Log out</a></p>
  `);
});

// Start server and bot
app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);
