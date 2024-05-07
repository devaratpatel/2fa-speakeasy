const express = require('express');
const speakeasy = require('speakeasy'); // this is generates a secret from speakeasy
const uuid = require('uuid');
const { JsonDB, Config } = require('node-json-db');

const app = express();

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

// once user is registered we'll create another route to verify using the authenticator to get a token and then we can verify that token against the temporary secret in the databse and if it validates or verifies then were going to change it from temp secret to secret

//and then we'll have a final route where we can just validate with any token from the authenticator

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
