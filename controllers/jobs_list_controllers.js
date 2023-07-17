const jwt = require('jsonwebtoken');
const axios = require('axios');
const jsonStringifySafe = require('json-stringify-safe');
require('dotenv').config();

// @desc Get job list
// @route GET - /api/job-list
// @access private
exports.jobList = (req, res) => {
    async function getData(descParam = 'Empty', locationParam = 'Empty', ftParam = 'Empty') {
        let descValue = [];
        let locationValue = [];

        try {
            const response = await axios.get('http://dev3.dansmultipro.co.id/api/recruitment/positions.json');
            const keys = response.data;

            // SEARCH DESC
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].description.toLowerCase().includes(descParam.toLowerCase())) {
                    descValue.push(i);
                }
            }

            // SEACRH LOCATION
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].location.toLowerCase().includes(locationParam.toLowerCase())) {
                    locationValue.push(i);
                }
            }

            console.log(descValue);
            console.log(locationValue);
        } catch (err) {
            res.status(400).json({
                status: 'error',
                code: 400,
                message: err
            });
        }
    }

    // VALIDATE TOKEN
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader.replace('Bearer ', '');
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (error, payload) => {
        if (error) {
            res.status(400);
            throw new Error(`Error validate token: ${error}`);
        }
        const description = req.query.description;
        const location = req.query.location;
        const full_time = req.query.full_time;

        getData(description, location, full_time);
    });
};