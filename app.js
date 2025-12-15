const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const { loadCSV, recommendSongs, getAllSongs } = require("./recommender");
const open = require("open");

app.use(express.static("public"));

let ready = false;

// Load songs
loadCSV()
  .then(() => {
    ready = true;
    console.log("Songs loaded and TF-IDF initialized");
  })
  .catch((err) => console.error(" Error loading songs:", err));

// Recommend songs endpoint
app.get("/recommend", (req, res) => {
  if (!ready)
    return res.json({
      error: "Server is still initializing, try again shortly",
    });

  const { song_name } = req.query;
  if (!song_name) return res.json({ error: "Please provide a song name" });

  const result = recommendSongs(song_name);
  if (result.error) return res.json(result);

  res.json({ input_song: song_name, recommended_songs: result });
});

// All songs for autocomplete
app.get("/songs", (req, res) => {
  if (!ready) return res.json([]);
  res.json(getAllSongs());
});


// After app.listen
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
});

