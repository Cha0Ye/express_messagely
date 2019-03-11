/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */


 const express = require('express');
 const router = express.Router();
 const User = require('../models/user');
 const expressError = require('../expressError');
 const jwt = require('jsonwebtoken');
 const { SECRET_KEY } = require("../config");
 const OPTIONS = {expiresIn: 60*60};


 router.post('/register', async function(req, res, next){
    try{
        const {username, password, first_name, last_name, phone} = req.body;
        const result = await User.register({username, password, first_name, last_name, phone});
        if(result){
            console.log('Secret is ', SECRET_KEY);
            let token = jwt.sign({username}, SECRET_KEY, OPTIONS);
            return res.json({token})
        }
        throw new expressError("Can't register!", 400);
    }
    catch(err){
        next(err);
    }
 });

 module.exports =  router;