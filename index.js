const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

require('dotenv').config();

const app = express();

const movieRoutes = require('./src/routes/movie');
const userRoutes = require('./src/routes/user');

app.get('/', (req, res) => {
  try {
    res.json({
      message: 'Fetched successfully',
    });
  } catch (err) {
    console.log(err);
  }
});
app.use(bodyParser.json());
const cors = require('cors');

app.use(cors());

app.use(express.static(path.join(__dirname, 'build')));

app.use(movieRoutes);
app.use(userRoutes);

// app.listen(8080, () => {
//   console.log('Server listening on port 8080');
// });

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 8080;

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.m75ia3o.mongodb.net/entertainmentWebApp`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then((result) => {
    app.listen(8080);
    console.log('connected');
  })
  .then((err) => {
    console.log(err);
  });

module.exports = app;
