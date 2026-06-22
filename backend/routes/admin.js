const express = require('express');
const router = express.Router();
const Officer = require('../models/Officer');

router.get('/officer-check', async (req, res) => {
  try {
    const count = await Officer.countDocuments();
    const officer = await Officer.findOne();

    res.json({
      success: true,
      officerExists: count > 0,
      count,
      officer: officer ? { id: officer._id, name: officer.name, email: officer.email } : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/clear-officers', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Not allowed in production' });
    }

    await Officer.deleteMany({});

    res.json({ success: true, message: 'All officers cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
