const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const user = new User({ firstName, lastName, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    await transporter.sendMail({
      to: email,
      subject: 'Activate your account',
      html: `<a href="http://localhost:3000/activate/${token}">Activate Account</a>`,
    });

    res.status(200).json({ message: 'Registration successful. Please check your email to activate your account.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.activateAccount = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.isActive = true;
    await user.save();

    res.status(200).json({ message: 'Account activated successfully.' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials or account not activated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
