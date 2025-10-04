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

const Student = {
  getAll: (callback) => {
    connection.query('SELECT * FROM students', callback);
  },
  getById: (id, callback) => {
    connection.query('SELECT * FROM students WHERE id = ?', [id], callback);
  }
};

module.exports = Student;