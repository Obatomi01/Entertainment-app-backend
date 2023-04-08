const Movie = require('../model/movie');
const User = require('../model/user');

const jwt = require('jsonwebtoken');
require('dotenv').config();

let loggedInUser;
exports.getMovies = (req, res, next) => {
  let isAuth;

  const token = req.headers.authorization.split(' ')[1];

  if (token) {
    isAuth = true;
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  loggedInUser = decodedToken.id;

  const categoryOfEntertainment = req.query.category;

  const categoryFilter = categoryOfEntertainment ? { category: categoryOfEntertainment } : {};

  const limit = +req.query.limit;
  const year = +req.query.year;
  const rating = req.query.rating;

  console.log(req.query);
  console.log('rating', rating);
  console.log('year', year);

  User.findById(loggedInUser).then(user => {
    if (!user) {
      throw new Error('Authentication unsuccessful');
    }
    Movie.find(categoryFilter).limit(limit).then(movies => {
      movies.forEach(movie => {
        movie.isBookmarked = user.bookmarks.includes(movie._id);
      });
      const trendingMovies = movies.filter(movie => {
        return movie.isTrending === true;
      });
      const movieCategory = movies.filter(movie => movie.category === 'Movie');
      const tvSeriesCategory = movies.filter(movie => movie.category === 'TV Series');
      let otherMovies = movies.filter(movie => {
        return movie.isTrending !== true;
      });

      const moviesSummary = movies.map(el => el.summary);

      // filter result

      if (year && rating !== undefined && rating !== 'null') {
        otherMovies = otherMovies.filter(movie => movie.year === year && movie.rating === rating);
      } else if (year) {
        otherMovies = otherMovies.filter(movie => movie.year === year);
      } else if (rating !== undefined && rating !== null) {
        otherMovies = otherMovies.filter(movie => movie.rating === rating);
      } else {
        otherMovies = otherMovies;
      }

      const allMovies = {
        trendingMovies: trendingMovies,
        otherMovies: otherMovies,
        movieCategory: movieCategory,
        tvSeriesCategory: tvSeriesCategory,
        summary: moviesSummary
      };
      return allMovies;
    }).then(result => {
      let currentCategory;
      if (categoryOfEntertainment) {
        currentCategory = Movie.find({ category: categoryOfEntertainment });
      } else {
        currentCategory = Movie.find();
      }

      currentCategory.countDocuments().then(length => {
        totalDramaLength = length;
        if (limit >= totalDramaLength) {
          res.status(200).json({
            message: 'Limit reached',
            data: result,
            showMore: false,
            isAuth: isAuth
          });
        } else {
          res.status(200).json({
            message: 'Fetched data successfully',
            data: result,
            showMore: true,
            isAuth: isAuth
          });
        }
      });
    }).catch(err => {
      console.error(err);
    });
  });
};

// Movie.find()
//   .limit(limit)
//   .then((result) => {
//     Movie.countDocuments().then((length) => {
//       totalDramaLength = length;
//       if (limit >= totalDramaLength) {
//         res.status(200).json({
//           message: 'Limit reached',
//           data: result,
//           showMore: false,
//         });
//       } else {
//         res.status(200).json({
//           message: 'Fetched data successfully',
//           data: result,
//           showMore: true,
//         });
//       }
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });

exports.bookmarkMovie = (req, res, next) => {
  const { id, bookmarkState } = req.body;
  console.log(true);
  if (bookmarkState) {
    User.updateOne({ _id: loggedInUser }, { $addToSet: { bookmarks: id } }).then(user => {
      Movie.findOneAndUpdate({
        _id: id
      }, { isBookmarked: bookmarkState }, { new: true }).then(movie => console.log(movie));
      Movie.find().lean().then(movies => {
        res.status(201).json({
          data: movies,
          message: 'Bookmark succcessful'
        });
      }).catch(err => {
        console.log(err);
      });
    }).catch(err => {
      console.error(err);
    });
  } else {
    User.updateOne({ _id: loggedInUser }, { $pull: { bookmarks: id } }).then(() => {
      Movie.findOneAndUpdate({
        _id: id
      }, { isBookmarked: bookmarkState }, { new: true }).then(movie => console.log(movie));
      Movie.find().then(movies => {
        res.status(201).json({
          data: movies,
          message: 'Bookmark succcessful'
        });
      });
      console.log('Bookmark removed');
    }).catch(err => {
      console.error(err);
    });
  }
};

exports.getBookmarkedMovies = (req, res, next) => {
  User.findById(loggedInUser).then(user => {
    Movie.find({ _id: { $in: user.bookmarks } }).then(movies => {
      movies.forEach(movie => {
        movie.isBookmarked = user.bookmarks.includes(movie._id);
      });
      res.status(200).json({ data: movies, message: 'Fetched succesfully' });
    });
  });
};

exports.getMovieSummary = (req, res, next) => {
  const { summaryId } = req.params;

  Movie.findById(summaryId).then(movie => {
    res.status(200).json({
      message: 'Summary successfully gotten',
      summary: movie.summary
    });
  }).catch(err => {
    console.log(err);
  });
};