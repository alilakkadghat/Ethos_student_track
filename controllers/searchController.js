const student = require('../models/student');
const wifiLog = require('../models/wifiLog');
const idSwipe = require('../models/idSwipe');
const Fuse = require('fuse.js');

exports.search = (req, res) => {
  const { query } = req.query;

  student.getAll((err, students) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const fuse = new Fuse(students, {
      keys: ['name', 'id']
    });

    const result = fuse.search(query);

    res.json(result);
  });
};