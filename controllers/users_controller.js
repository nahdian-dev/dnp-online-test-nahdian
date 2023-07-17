const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const connection = require('../connections/mysql_connection');

// @desc Account Register
// @route POST - /users/register
// @access public
exports.userRegister = (req, res) => {
    // ==== VALIDATE ====
    const validateReqBody = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,16}$')),
        repeat_password: Joi.ref('password'),
    });

    const { error, value } = validateReqBody.validate(req.body);

    if (error) {
        res.status(400);
        throw new Error(`Error when validate body: ${error}`);
    }

    // ==== INSTANCE DB ====
    const createConnection = connection.createConnection();

    // ==== POST TO DB ====
    function postDataToDB(usernameAvailability) {
        // IS AVAILABLE
        if (usernameAvailability === 1) {
            res.status(400).json({
                title: "BAD_REQUEST",
                message: "Username Already exists!"
            });
        };

        // IS DUPLICATED
        if (usernameAvailability > 1) {
            res.status(400).send('Email is duplicate!');
        };

        // IS NOT AVAILABLE
        if (usernameAvailability === 0) {
            // ==== HASH PASSWORD ====
            const hashPassword = bcrypt.hashSync(value.password, 10);

            // ==== POST DATA =====
            const sqlPostData = `INSERT INTO users(username, email, password) values('${value.username}','${value.email}','${hashPassword}')`;
            createConnection.query(sqlPostData, (error) => {
                if (error) {
                    res.status(400);
                    throw new Error(`Error when upload data to db: ${error}`);
                };

                res.status(200).json({
                    message: 'Register success!',
                    accepted: value.email
                });
            });

            createConnection.end();
        };
    }

    const sqlCheckEmail = `SELECT username FROM users WHERE username = '${value.username}'`;

    createConnection.query(sqlCheckEmail, (error, result, query) => {
        if (error) throw new Error('Failed to check username!');

        const usernameAvailability = Object.entries(result).length;
        postDataToDB(usernameAvailability);
    });
};

// @desc Login Account
// @route GET - /users/login
// @access public
exports.userLogin = (req, res) => {
    // ==== VALIDATE BODY ====
    const validateReqBody = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
    });

    const { error, value } = validateReqBody.validate(req.body);

    if (error) {
        res.status(400);
        throw new Error(`Error when validate body: ${error}`);
    }

    // ==== INSTANCE DB ====
    const createConnection = connection.createConnection();

    // ==== GET DATA FROM DB ====
    const sqlGetUsernamePass = `SELECT username, password FROM users WHERE username = '${value.username}'`;

    createConnection.query(sqlGetUsernamePass, (error, results, fields) => {
        if (error) {
            res.status(400).send('Failed to login!');
        }

        const usernameAvailability = Object.entries(results).length;

        if (usernameAvailability === 0) {
            res.status(403).send('Unregistered Username!');
        }

        if (usernameAvailability === 1) {
            const resultPassword = results[0].password;

            bcrypt.compare(value.password, resultPassword, (err, result) => {
                if (err) {
                    console.error(err);
                }

                if (!result) {
                    res.status(400).send(`Password do not match!`);
                }

                if (result) {
                    const payload = {
                        email: value.email
                    };

                    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

                    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decode) => {
                        if (err) {
                            console.error(err);
                        }

                        res.status(200).json({
                            message: 'Login succesfully!',
                            email: value.email,
                            expiredIn: decode.exp,
                            token: token
                        });
                    });
                }
            });
        }
    });

};