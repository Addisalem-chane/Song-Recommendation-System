const express = require("express");
const recommendSongs = require("./recommender");

const app = express();

// IMPORTANT: Use environment PORT
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ message: "Song Recommendation System API" });
});

app.get("/recommend", (req, res) => {
  const songName = req.query.song_name;

  if (!songName) {
    return res.status(400).json({
      error: "song_name query parameter is required",
    });
  }

  const recommendations = recommendSongs(songName);

  res.json({
    input_song: songName,
    recommended_songs: recommendations,
  });
});

// ✅ LISTEN USING PORT PROVIDED BY HOST
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
