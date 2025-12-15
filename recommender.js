const path = require("path");
const preprocessData = require("./dataProcessing");
const natural = require("natural");
const Fuse = require("fuse.js");

let df = [];
let tfidf;
let tfidfVectors = [];
let fuse; // Fuzzy search instance

// Load and preprocess CSV
async function loadCSV() {
  const csvPath = path.join(__dirname, "data", "songs.csv");
  df = await preprocessData(csvPath);
  init(); // Initialize TF-IDF
  initFuse(); // Initialize fuzzy search
}

// Initialize TF-IDF matrix
function init() {
  tfidf = new natural.TfIdf();
  df.forEach((d) => tfidf.addDocument(d.combined_text));

  tfidfVectors = df.map((_, i) => {
    const vec = [];
    tfidf.listTerms(i).forEach((item) => {
      vec.push({ term: item.term, tfidf: item.tfidf });
    });
    return vec;
  });
}

// Initialize Fuse.js
function initFuse() {
  const options = {
    keys: ["song"], // search only song titles
    threshold: 0.4, // adjust: 0 = exact match, 1 = very fuzzy
    includeScore: true,
  };
  fuse = new Fuse(df, options);
}

// Compute cosine similarity
function cosineSim(vecA, vecB) {
  const mapA = new Map(vecA.map((x) => [x.term, x.tfidf]));
  const mapB = new Map(vecB.map((x) => [x.term, x.tfidf]));

  const allTerms = new Set([...mapA.keys(), ...mapB.keys()]);
  let dot = 0,
    normA = 0,
    normB = 0;

  allTerms.forEach((term) => {
    const a = mapA.get(term) || 0;
    const b = mapB.get(term) || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  });

  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

// Recommend songs
function recommendSongs(songName, topN = 5) {
  if (!fuse) return { error: "Search not initialized yet" };

  // Use fuzzy search to find the best match
  const results = fuse.search(songName.trim());
  if (!results.length) return { error: "Song not found in dataset" };

  const bestMatch = results[0].item; // best fuzzy match
  const idx = df.findIndex((d) => d.song === bestMatch.song);

  const similarities = df.map((_, i) =>
    cosineSim(tfidfVectors[idx], tfidfVectors[i])
  );

  const sorted = similarities
    .map((score, i) => ({ i, score }))
    .sort((a, b) => b.score - a.score)
    .slice(1, topN + 1); // skip itself

  return sorted.map((s) => ({
    title: df[s.i].song,
    artist: df[s.i].artist,
  }));
}

// Return all song titles
function getAllSongs() {
  return df.map((d) => d.song);
}

module.exports = { loadCSV, recommendSongs, getAllSongs };
