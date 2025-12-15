const natural = require("natural");
const preprocessData = require("./dataPreprocessing");

const TfIdf = natural.TfIdf;
let songs = [];
let tfidf = new TfIdf();

// Load and prepare data ONCE
(async () => {
  songs = await preprocessData("data/songs.csv");

  songs.forEach((song) => {
    tfidf.addDocument(song.combined_text);
  });
})();

// Cosine similarity function
function cosineSimilarity(vecA, vecB) {
  let dot = 0.0;
  let normA = 0.0;
  let normB = 0.0;

  for (let key in vecA) {
    if (vecB[key]) dot += vecA[key] * vecB[key];
    normA += vecA[key] ** 2;
  }

  for (let key in vecB) {
    normB += vecB[key] ** 2;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function getVector(index) {
  const vec = {};
  tfidf.listTerms(index).forEach((item) => {
    vec[item.term] = item.tfidf;
  });
  return vec;
}

function recommendSongs(songName, topN = 5) {
  const index = songs.findIndex(
    (s) => s.song.toLowerCase() === songName.toLowerCase()
  );

  if (index === -1) {
    return { error: "Song not found in dataset" };
  }

  const targetVector = getVector(index);
  const scores = [];

  songs.forEach((_, i) => {
    if (i !== index) {
      const score = cosineSimilarity(targetVector, getVector(i));
      scores.push({ index: i, score });
    }
  });

  scores.sort((a, b) => b.score - a.score);

  return scores.slice(0, topN).map((item) => ({
    title: songs[item.index].song,
    artist: songs[item.index].artist,
  }));
}

module.exports = recommendSongs;
