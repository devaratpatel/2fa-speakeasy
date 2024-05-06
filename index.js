const express = require('express');

const app = express();

app.get('/api', (req, res) => res.json({ message: 'Welcome to the two factor authentication project' }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
