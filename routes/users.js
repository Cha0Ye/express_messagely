const express = require('express');
const User = require('../models/user');
const ExpressError = require('../expressError');

const router = express.Router();

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/', async function(req, res, next){
    try{
        const users = await User.all();

        return res.json({ users });
    }
    catch(err){
        next(err);
    }
})



/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get('/:username', async function(req, res, next){
    try{
        let userName = req.params.username;
        let user = await User.get(userName);
        if(!user){
            throw new ExpressError("User does not exist!",404);
        }

        return res.json(user);
    }
    catch(err){
        next(err);
    }


});


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/


 module.exports = router;