const express = require('express');
const speakeasy = require('speakeasy'); // this is
const bodyParser = require('body-parser');
const uuid = require('uuid');

const { JsonDB, Config } = require('node-json-db');

const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const db = new JsonDB(new Config('myDataBase', true, false, '/'));

console.log('Database initialized successfully.');

app.get('/api', (req, res) => res.json({ message: 'Welcome to the two factor authentication project' }));

// Register a user and create a temporary secret

app.post('/api/register', (req, res) => {
  const id = uuid.v4();

  try {
    const path = `/user/${id}`;
    const temp_secret = speakeasy.generateSecret();
    db.push(path, { id, temp_secret });
    res.json({ id, secret: temp_secret.base32 });
  } catch (error) {
    console.log('This is error: ', error);
    res.status(500).json({ message: 'Error generating the secret' });
  }
});

// Verify token and make secret perm

app.post('/api/verify', async (req, res) => {
  const { userId, token } = req.body;
  try {
    // Retrieve user from database
    const path = `/user/${userId}`;
    const user = await db.getData(path);
    console.log('----> 1', { user });
    console.log('-----> 2', user.secret);
    console.log('-----> 3', user.temp_secret);
    const { base32: secret } = user.temp_secret;
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });
    if (verified) {
      // Update user data
      db.push(path, { id: userId, secret: user.temp_secret });
      res.json({ verified: true });
    } else {
      res.json({ verified: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving user' });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
