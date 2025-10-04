const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'ali@123$',
  database: 'schooldb'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});

const IdSwipe = {
  getAll: (callback) => {
    connection.query('SELECT * FROM card_swipe', callback);
  },
  getById: (id, callback) => {
    connection.query('SELECT * FROM card_swipe WHERE location_id ="gym"', [id], callback);
  }
};

module.exports = IdSwipe;