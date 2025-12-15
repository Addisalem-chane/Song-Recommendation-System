const fs = require("fs");
const csv = require("csv-parser");

function preprocessData(csvPath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const seen = new Set();

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        if (row.song && row.artist && row.text) {
          const key = `${row.song}-${row.artist}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({
              song: row.song,
              artist: row.artist,
              combined_text: `${row.song} ${row.artist} ${row.text}`,
            });
          }
        }
      })
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

module.exports = preprocessData;
