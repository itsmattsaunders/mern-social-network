const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check')

//@route POST api/users
//@desc Register user route
//@access public
router.post('/', (req, res) => {
//   res.send(req.body) 
// }

[
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'A valid email is required').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({min: 6})
], (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    res.status(400).json({ errors: errors.array() });
  } 

}
 



module.exports = router;