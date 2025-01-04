const URL = require('../models/URL');
const shortid = require('shortid');

exports.createShortURL = async (req, res) => {
  const { longUrl } = req.body;
  const shortUrl = shortid.generate();

  try {
    const url = new URL({ longUrl, shortUrl, createdBy: req.user.id });
    await url.save();

    res.status(201).json(url);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.redirectToLongURL = async (req, res) => {
  const { shortUrl } = req.params;

  try {
    const url = await URL.findOne({ shortUrl });
    if (!url) return res.status(404).json({ message: 'URL not found.' });

    url.clicks += 1;
    await url.save();

    res.redirect(url.longUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
