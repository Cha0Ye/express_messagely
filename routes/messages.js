const express = require('express');
const Message = require('../models/message');
const ExpressError = require('../expressError');
const { ensureLoggedIn, ensureCorrectUser} = require('../middleware/auth');

const router = express.Router();



/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async function(req, res, next){
    try{

        const id = req.params.id;
        const message = await Message.get(id);

        const curr_user = req.user.username;

        if(message.from_user.username !== curr_user &&
            message.to_user.username !== curr_user){
            throw new ExpressError("Not authorized", 401);
        }

        return res.json({ message });
    } catch(err){
        next(err);
    }
})



/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async function(req, res, next) {
    try{
        let currentUser = req.user.username;
        let {to_username, body} = req.body;
        let result = await Message.create({from_username: currentUser, to_username, body});
        return res.json({"message":result})
    }
    catch(err){
        next(err);
    }

});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

 router.post('/:id/read', ensureLoggedIn, async function(req, res, next){
     try{
        const id = req.params.id;
        const message = await Message.get(id);
        const to_username = message.to_user.username;

        if(req.user.username !== to_username){
            throw new ExpressError("Not authorized", 401);
        }

        let markedMessage = await Message.markRead(id);

        return res.json({ "message": markedMessage });
     } catch(err) {
         next(err);
     }
 })

module.exports = router;


/*
"_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkN5bnRoaWEiLCJpYXQiOjE1NTI0MTM5NzgsImV4cCI6MTU1MjQxNzU3OH0.XTrQR0zA5Uw2-5xQO8uImEre3dlyNRnNaj612qOX4ME",
"to_username": "Whiskey",
	"body":"hello there! "
*/