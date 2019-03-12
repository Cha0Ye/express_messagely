/** User class for message.ly */

const bcrypt = require('bcrypt');
const db = require('../db');
const { BCRYPT_WORK_ROUNDS } = require('../config');

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    try{
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_ROUNDS);
      const result = await db.query(
        `INSERT INTO users (username, password, first_name, last_name, phone, join_at )
               VALUES ($1, $2, $3, $4, $5, current_timestamp)
               RETURNING username, password, first_name, last_name, phone, join_at`,
        [username, hashedPassword, first_name, last_name, phone]);

        return result.rows[0];
    } catch(err){
      throw {"message": "User name taken", "status": 400};
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password FROM users
       WHERE username=$1`,
      [username]);

    const user = result.rows[0];
    if(user){
      return await bcrypt.compare(password, user.password);
    }

    return false;

    // return user && await bcrypt.compare(pasword, user.password)
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    try{
      const result = await db.query(
        `UPDATE users
         SET last_login_at=current_timestamp
         WHERE username=$1`,
        [username]);

    } catch(err) {
      throw {"message":"Update Login Timestamp failed", "status":500}
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name FROM users`
    );

    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const user = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
       FROM users
      WHERE username=$1`, [username]);
    return user.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT id, body, sent_at, read_at, u2.username, u2.first_name, u2.last_name, u2.phone
       FROM users AS u1
       JOIN messages ON u1.username = from_username
       JOIN users AS u2 ON messages.to_username = u2.username
      WHERE u1.username=$1`,
      [username]);

      const messages = result.rows;

      const newMessages = [];
      for(let message of messages){
        let {id, body, sent_at, read_at, ...rest} = message;
        // message["to_user"] = rest;
        newMessages.push({id, body, sent_at, read_at, 'to_user': rest});

      }

      return newMessages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT id, body, sent_at, read_at, u2.username, u2.first_name, u2.last_name, u2.phone
      FROM users AS u1
      JOIN messages
      ON u1.username = to_username
      JOIN users AS u2
      ON from_username = u2.username
      WHERE u1.username=$1`, [username]);

      const messages =[];

      for(let message of result.rows){
        let {id, body, sent_at, read_at, ...rest} = message;
        messages.push({id, body, sent_at, read_at, "from_user":rest});
      }
      return messages;

  }
}


module.exports = User;