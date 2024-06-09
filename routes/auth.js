const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const config = require('config');
const auth = require('../middleware/auth'); // Import the auth middleware

// @route   POST api/auth/signup
// @desc    Register user
// @access  Public
router.post(
  '/signup',
  [
    check('fullName', 'Full name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation Errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password } = req.body;
    console.log('Request Body:', req.body);

    try {
      let user = await User.findOne({ email });
      console.log('User:', user);

      if (user) {
        console.log('User already exists');
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        name: fullName,
        email,
        password,
      });
      console.log('New User:', user);

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      console.log('User Saved:', user);

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('Server Error:', err.message);
      res.status(500).send('Server error');
    }
  }
);

router.post(
    '/signin',
    [
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Password is required').exists(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { email, password } = req.body;
  
      try {
        let user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ errors: [{ msg: 'User doesnt exist' }] });
        }
  
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }
  
        const payload = {
          user: {
            id: user.id,
          },
        };
        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: 360000 },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
    }
  );

  router.get('/validate', auth, (req, res) => {
    res.json({ msg: 'Token is valid' });
  });

  router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
  
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'User not found' }] });
      }
  
      const payload = {
        user: {
          id: user.id,
        },
      };
  
      const resetToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.json({ resetToken });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  
  // @route   POST api/auth/reset-password
  // @desc    Reset user password
  // @access  Public
  router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user = await User.findById(decoded.user.id);
  
      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'User not found' }] });
      }
  
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();
  
      res.json({ msg: 'Password updated successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  

module.exports = router;
