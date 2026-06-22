const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const generateToken = require('../utilis/generateToken');
const bcryptjs = require('bcryptjs')


const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }
  
  const hashedPassword = await bcryptjs.hash(password, 10)

  // Password hashing happens automatically in the User model's pre-save hook
  const user = await User.create({ name, email, password: hashedPassword });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // password has `select: false` in the schema, so it must be explicitly requested here
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  const matchingPassword = await bcryptjs.compare(password, user.password)

  if (!user || !matchingPassword) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
});


const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { registerUser, loginUser, getMe };