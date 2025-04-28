const functions = require('firebase-functions');
const fetchAnime = require('./src/services/fetchAnime');

exports.searchAnime = functions.https.onRequest(async (req, res) => {
  const title = req.query.title;
  if (!title) {
    return res.status(400).json({ error: 'Missing title parameter.' });
  }

  try {
    const animeData = await fetchAnime(title);
    res.status(200).json(animeData);
  } catch (error) {
    console.error('Anime search failed:', error.message);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});