const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const connection = require('./connections/mysql_connection');
const errorHandling = require('./error_handling');
const usersRoutes = require('./routes/users_routes');
const jobList = require('./routes/job_list_routes');

const app = express();
const port = process.env.PORT || 5001;

connection.mysqlConnetion();

// parser
app.use(bodyParser.json());

// routes
app.use('/api/users', usersRoutes);
app.use('/api/job-list', jobList);
app.use((req, res, next) => {
    res.status(404);
    throw new Error('Page not found!');
    next();
});

app.use(errorHandling.errorHandling);

app.listen(port, () => {
    console.log(`- Server are listening on port: ${port}`);
});