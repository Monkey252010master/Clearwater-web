// bot.js
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded IDs and OAuth credentials
const GUILD_ID = "1411784213795045518";
const STAFF_ROLE_ID = "1416789375529783329";
const DISCORD_CLIENT_ID = "PUT_YOUR_CLIENT_ID_HERE";
const DISCORD_CLIENT_SECRET = "PUT_YOUR_CLIENT_SECRET_HERE";
const DISCORD_REDIRECT_URI = "https://YOUR-RENDER-APP.onrender.com/auth/discord/callback";

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
      clientID: DISCORD_CLIENT_ID,
      clientSecret: DISCORD_CLIENT_SECRET,
      callbackURL: DISCORD_REDIRECT_URI,
      scope: ["identify"]
    },
    (accessToken, refreshToken, profile, done) => {
      const user = { id: profile.id, username: profile.username, avatar: profile.avatar };
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
  if (message.content === "!ping") message.reply("Pong! 🏓");
});

// Auth routes
app.get("/auth/discord", passport.authenticate("discord"));

app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/"); // back to homepage after login
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

// Staff dashboard
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

// Health
app.get("/", (req, res) => {
  res.send("Homepage is served by GitHub Pages. Backend is running.");
});

app.listen(PORT, () => console.log(`🌐 Web server on ${PORT}`));
client.login(process.env.DISCORD_TOKEN);
