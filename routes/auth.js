const express = require('express');
const router = express.Router();
const User = require('../models/user');
const ExpressError = require('../expressError');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require("../config");
const OPTIONS = {expiresIn: 60*60};

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async function(req, res, next){
    try{
        const {username, password, first_name, last_name, phone} = req.body;
        const currUser = await User.register({username, password, first_name, last_name, phone});
        await User.updateLoginTimestamp(username);
        let token = jwt.sign({username}, SECRET_KEY, OPTIONS);
        return res.json({token})

    }
    catch(err){
        next(err);
    }
});

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async function(req, res, next){
    try{
        const {username, password} = req.body;
        const result = await User.authenticate(username, password);
        await User.updateLoginTimestamp(username);
        if(result){
            let token = jwt.sign({username}, SECRET_KEY, OPTIONS);
            return res.json({token})
        }
        throw new ExpressError("Can't authenticate!", 400);
    }
    catch(err){
        next(err);
    }
});

module.exports =  router;