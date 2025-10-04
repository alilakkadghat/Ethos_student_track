import mysql from "mysql2/promise";
const connection =await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'ali@123$',
  database: 'schooldb'
});
console.log("MYSQL connected successfully");
const [rows] =await connection.execute('SELECT * FROM lab_checkout');
console.log(rows);
await connection.end();