const express = require('express');
require('dotenv').config();

const connection = require('./connections/mysql_connection');

const app = express();
const port = process.env.PORT || 5001;

connection.mysqlConnetion();

app.listen(port, () => {
    console.log(`- Server are listening on port: ${port}`);
});