const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'campus_security'
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
    connection.query('SELECT * FROM id_swipes', callback);
  },
  getById: (id, callback) => {
    connection.query('SELECT * FROM id_swipes WHERE id = ?', [id], callback);
  }
};

module.exports = IdSwipe;