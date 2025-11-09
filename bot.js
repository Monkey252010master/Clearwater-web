const express = require("express");
const fetch = require("node-fetch");
const app = express();

// Status route that talks to ER:LC API
app.get("/status", async (req, res) => {
  try {
    const response = await fetch("https://api.policeroleplay.community/v1/server/players", {
      headers: {
        "Server-Key": process.env.ERLC_API_KEY // keep your ERLC token safe in env vars
      }
    });

    if (!response.ok) {
      throw new Error("ERLC API error: " + response.status);
    }

    const data = await response.json();
    const playerCount = data.players ? data.players.length : 0;

    res.json({
      players: playerCount,
      sessionActive: false // flip to true when you SSU
    });
  } catch (err) {
    console.error(err);
    res.json({ players: 0, sessionActive: false });
  }
});

// If you don’t already have this:
app.listen(3000, () => console.log("Bot backend running on port 3000"));
