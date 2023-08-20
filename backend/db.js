const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Accolite@4477",
    database: "online_shopping"
  });

  module.exports = pool;