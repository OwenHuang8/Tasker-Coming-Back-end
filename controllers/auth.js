const axios = require('axios');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { BadRequestError, UnauthenticatedError } = require('../errors');

// @desc    Register new user
// @route   POST /v1/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  try {
    // google register
    if (req.body.googleAccessToken) {
      const { googleAccessToken } = req.body;
      axios
        .get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
          },
        })
        .then(async (response) => {
          const firstName = response.data.given_name;
          const lastName = response.data.family_name;
          const { email } = response.data;
          const user = new User({ firstName, lastName, email });
          await user.save();
          const token = user.createJWT();
          res.status(201).json({
            user: { firstName: user.firstName, lastName: user.lastName, email: user.email },
            token,
          });
        });
    } else {
      // email register
      const { firstName, lastName, email, password, confirmPassword } = req.body;
      const user = new User({ firstName, lastName, email, password, confirmPassword });
      await user.save();
      const token = user.createJWT();
      res.status(201).json({
        user: { firstName: user.firstName, lastName: user.lastName, email: user.email },
        token,
      });
    }
  } catch (error) {
    res.status(400);
    throw new BadRequestError('Please add all fields');
  }
});

// @desc    Authenticate a user
// @route   POST /v1/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  if (req.body.googleAccessToken) {
    // google login
    const { googleAccessToken } = req.body;
    axios
      .get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      })
      .then(async (response) => {
        const firstName = response.data.given_name;
        const lastName = response.data.family_name;
        const { email } = response.data;
        const user = new User({ firstName, lastName, email });
        await user.save();
        const token = user.createJWT();
        res.status(201).json({
          user: { firstName: user.firstName, lastName: user.lastName, email: user.email },
          token,
        });
      });
  } else {
    // email login
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new BadRequestError('Please add all fields');
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(400);
      throw new UnauthenticatedError('Invalid credentials');
    }

    const isCorrect = await user.comparePassword(password);

    if (!isCorrect) {
      res.status(400);
      throw new UnauthenticatedError('Invalid credentials');
    }
    const token = user.createJWT();
    user.password = undefined;
    res.status(201).json({ user, token });
  }
});
const forgotPassword = asyncHandler(async (req, res) => {});
const resetPassword = asyncHandler(async (req, res) => {});

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
