const jwt = require('jsonwebtoken');
const axios = require('axios');
const _ = require('lodash');
const jsonStringifySafe = require('json-stringify-safe');
require('dotenv').config();

// @desc Get job list
// @route GET - /api/job-list
// @access private
exports.jobList = (req, res) => {
    async function getData(descParam = 'Empty', locationParam = 'Empty', ftParam = 'Empty') {
        let descValue = [];
        let locationValue = [];
        let ftValue = [];

        try {
            const response = await axios.get('http://dev3.dansmultipro.co.id/api/recruitment/positions.json');
            const keys = response.data;

            // SEARCH value
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].description.toLowerCase().includes(descParam.toLowerCase())) {
                    descValue.push(i);
                }
                if (keys[i].location.toLowerCase().includes(locationParam.toLowerCase())) {
                    locationValue.push(i);
                }
                if (ftParam.includes('true')) {
                    ftValue.push(i);
                }
            }

            let result;
            let numArray = 0;
            const merge = _.concat(descValue, locationValue, ftValue);

            if (descValue.length > 1) {
                numArray += 1;
            }
            if (locationValue.length > 1) {
                numArray += 1;
            }
            if (ftValue.length > 1) {
                numArray += 1;
            }

            if (numArray === 3) {
                result = _(merge)
                    .groupBy()
                    .pickBy(values => values.length === 3)
                    .keys()
                    .map(Number)
                    .value();
            }

            if (numArray === 2) {
                result = _(merge)
                    .groupBy()
                    .pickBy(values => values.length === 2)
                    .keys()
                    .map(Number)
                    .value();
            }

            if (numArray === 1) {
                result = _(merge)
                    .groupBy()
                    .pickBy(values => values.length === 1)
                    .keys()
                    .map(Number)
                    .value();
            }

            if (numArray === 0) {
                res.status(200).json({
                    status: 'success',
                    code: 200,
                    data: keys
                });
            }

            let message = [];

            result.forEach(value => {
                message.push(keys[value]);
            });

            res.status(200).json({
                status: 'success',
                code: 200,
                message: message
            });

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
            res.json({
                status: 'error',
                code: 404,
                message: error
            });
        }

        const description = req.query.description;
        const location = req.query.location;
        const full_time = req.query.full_time;

        getData(description, location, full_time);
    });
};

// @desc Get job detail
// @route GET - /api/job-list/job-detail/:id
// @access private
exports.jobDetail = (req, res) => {
    async function getJobDetail(paramID) {
        const response = await axios.get('http://dev3.dansmultipro.co.id/api/recruitment/positions.json');
        const keys = response.data;

        let found = false;

        // SEACRH ID
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].id.includes(paramID)) {
                res.status(200).json({
                    status: 'success',
                    code: 200,
                    data: keys[i]
                });
                found = true;
                break;
            }
        }

        if (!found) {
            res.status(404).json({
                status: 'ID not found!',
                code: 404
            });
        }
    }

    // VALIDATE TOKEN
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader.replace('Bearer ', '');

    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, payload) => {
        if (error) {
            res.json({
                status: 'error',
                code: 404,
                message: error
            });
        }

        getJobDetail(req.params.id);
    });
};