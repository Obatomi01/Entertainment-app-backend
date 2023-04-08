const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();

const movieRoutes = require('./routes/movie');
const userRoutes = require('./routes/user');

app.use(bodyParser.json());
const cors = require('cors');

app.use(cors());

app.use(movieRoutes);
app.use(userRoutes);

// app.listen(8080, () => {
//   console.log('Server listening on port 8080');
// });

const PORT = process.env.PORT || 8080;

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.m75ia3o.mongodb.net/entertainmentWebApp`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then((result) => {
    app.listen(PORT);
  })
  .then((err) => {
    console.log(err);
  });
