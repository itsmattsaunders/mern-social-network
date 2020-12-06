const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require("../../models/User");
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');



//@route POST api/users
//@desc Register user route
//@access public

router.post('/',
[
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'A valid email is required').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({min: 6})
], async (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    console.log("There's Errors here")
    console.log(errors)
    res.status(400).json({ errors: errors.array() });
    return;
  } 


  //destructuring the fields in req.body
  const { name, email, password } = req.body
  try{
  //See if user exists
    let user = await User.findOne({ email })
    if(user){
     return res.status(400).json({ errors: [{ msg: 'User already exists'}] });
    }

    //Get Users Gravatar
    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    })

  //Encrypt password
  user = new User({
    name,
    email,
    avatar,
    password
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  await user.save();

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
  } catch (err){
    console.error(err.message)
    res.status(500).send("Server error")
  }
});



module.exports = router;