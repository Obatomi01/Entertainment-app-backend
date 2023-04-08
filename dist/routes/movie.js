const express = require('express');

const router = express.Router();

const movieControllers = require('../controllers/movie');

router.get('/movies', movieControllers.getMovies);

router.post('/movies/bookmark', movieControllers.bookmarkMovie);

router.get('/movies/bookmarks', movieControllers.getBookmarkedMovies);

router.get('/movies/:summaryId', movieControllers.getMovieSummary);

module.exports = router;