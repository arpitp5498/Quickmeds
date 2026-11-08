const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      tokenVersion: user.tokenVersion || 0
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN, algorithm: 'HS256', issuer: 'quickmeds', audience: 'quickmeds-web'
    }
  );
};

module.exports = {
  generateToken
};
