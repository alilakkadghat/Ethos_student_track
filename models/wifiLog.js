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

const WifiLog = {
  getAll: (callback) => {
    connection.query('SELECT * FROM wifi_logs', callback);
  },
  getById: (id, callback) => {
    connection.query('SELECT * FROM wifi_logs WHERE id = ?', [id], callback);
  }
};

module.exports = WifiLog;