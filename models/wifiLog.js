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

const WifiLog = {
  getAll: (callback) => {
    connection.query('SELECT * FROM wifi_log', callback);
  },
  getById: (id, callback) => {
    connection.query('SELECT * FROM wifi_log WHERE ap_id ="AP_LAB_2"', [id], callback);
  }
};

module.exports = WifiLog;