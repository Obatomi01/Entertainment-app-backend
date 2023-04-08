const bcrypt = require('bcrypt');
const saltRounds = 10;

const jwt = require('jsonwebtoken');
require('dotenv').config();

const nodemailer = require('nodemailer');

const User = require('../model/user');

function toTitleCase(str) {
  return str.toLowerCase().replace(/(^|\s)\S/g, function (firstLetter) {
    return firstLetter.toUpperCase();
  });
}

exports.signUpUser = (req, res, next) => {
  //We need to get the password, email, check if the confirm password matches the password
  // TODO use 'validator.js' to validate the email and password and other things to be validated
  const { email, password, userName } = req.body;
  const userNameCorrectFormat = toTitleCase(userName);

  User.findOne({ email: email }).then((user) => {
    if (user) {
      return res.status(409).json({
        message: 'Signup failed',
        success: false,
      });
    } else {
      bcrypt
        .genSalt(saltRounds)
        .then((salt) => bcrypt.hash(password, salt))
        .then((hashedPassword) => {
          const newUser = new User({
            email: email,
            password: hashedPassword,
            userName: userNameCorrectFormat,
          });

          newUser.save().then((user) => {
            const userId = user._id.toString();
            const payload = {
              id: userId,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET);

            if (user) {
              res.status(201).json({
                message: 'Signup Successful',
                success: true,
                token: token,
                userName: user.userName,
              });
            } else {
              res.status(404).json({
                message: 'Signup failed',
                success: false,
              });
            }
          });
        })
        .catch((err) => console.log(err));
    }
  });
};

exports.logInUser = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email: email }).then((acc) => {
    if (!acc) {
      return res.status(404).json({
        message: 'Email does not exist or passwords do not match',
        success: false,
      });
    }

    // setting up jwt
    const userId = acc._id.toString();
    const payload = {
      id: userId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    bcrypt
      .compare(password, acc.password)
      .then((result) => {
        if (result) {
          res.status(200).json({
            message: 'Login Successful',
            success: true,
            token: token,
            userName: acc.userName,
          });
        } else {
          res.status(404).json({
            message: 'Incorrect email or password',
            success: false,
          });
        }
      })
      .catch((err) => console.log(err));
  });
};

exports.requestPasswordReset = (req, res, next) => {
  const { email } = req.body;
  let userId;
  User.findOne({ email: email }).then((user) => {
    if (!user) {
      return res.status(404).json({
        message: "User with this email doesn't exist",
        success: false,
      });
    }
    userId = user._id.toString();

    // setting up jwt
    const payload = {
      id: userId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '5m',
    });

    // preventing series of password requests
    const resetPasswordExpires = Date.now() + 3600000;

    const canResetPasswordHandler = (user) => {
      const now = Date.now();

      const resetExpires = user.resetPasswordExpires;

      return !resetExpires || now > resetExpires.getTime();
    };

    const canResetPassword = canResetPasswordHandler(user);

    if (canResetPassword) {
      user.resetPasswordExpires = resetPasswordExpires;

      user.save();
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_SENDER,
          pass: 'rwlzpdruiteyfryg',
        },
      });

      let mailOptions = {
        from: 'Entertainment web-app',
        to: `${email}`,
        subject: 'Password Reset Request',
        html: `<p>Dear ${user.userName},</p><p>Please click on the link below to reset your password:</p><a href=${process.env.RESET_PASSWORD_LINK}?token=${token}>Reset Password</a><p>This Link expires after 5minutes.</p><p>Best regards,</p><p>Entertainment Web App</p>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          res.status(201).json({
            message: 'Email sent',
            success: true,
          });
        }
      });
    } else {
      res.status(429).json({
        message: 'Too many email requests, try again later',
        success: false,
      });
    }
  });
};

exports.resetPassword = (req, res, next) => {
  const { password } = req.body;

  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(401).json({
        message: 'Password Link has expired!!',
        success: false,
      });
    } else {
      const loggedInUser = decoded.id;

      bcrypt
        .genSalt(saltRounds)
        .then((salt) => bcrypt.hash(password, salt))
        .then((hashedPassword) => {
          User.findByIdAndUpdate(
            loggedInUser,
            {
              password: hashedPassword,
            },
            { new: true }
          ).then((updatedUser) => {
            if (updatedUser) {
              res.status(201).json({
                message: 'Password reset succesful',
                success: true,
              });
            }
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
};
