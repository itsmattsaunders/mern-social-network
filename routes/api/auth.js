const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const bcrypt = require('bcryptjs')
const User = require('../../models/User')
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');


//@route GET api/auth
//@desc test route
//@access public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
})

//@route POST api/auth
//@desc Register authentication and get token
//@access public

router.post('/',
  [
    check('email', 'A valid email is required').isEmail(),
    check('password', 'Password is required').exists()
  ], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log("There's Errors here")
      console.log(errors)
      res.status(400).json({ errors: errors.array() });
      return;
    }


    //destructuring the fields in req.body
    const { email, password } = req.body
    try {
      //See if user exists
      let user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      //Return JWT
      const payload = {
        user: {
          id: user.id
        }
      }

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      // res.send(req.body)
      // res.send("User is registered")
    } catch (err) {
      console.error(err.message)
      res.status(500).send("Server error")
    }
  });

module.exports = router