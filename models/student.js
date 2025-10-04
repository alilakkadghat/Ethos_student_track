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

const Student = {
  getAll: (callback) => {
    connection.query('SELECT * FROM profile', callback);
  },
  getById: (id, callback) => {
    connection.query('SELECT * FROM students WHERE department = "BIO"', [id], callback);
  }
};

module.exports = Student;