const mysql = require("mysql2/promise");
const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "daman",
});
export default connection;
