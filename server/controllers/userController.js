const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Function to change user's password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required.' });
    }

    // Extract user ID from the token
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your JWT secret
    const userId = decoded.id; // Assuming the token payload contains `id`

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the old password matches
    const isMatch = await user.comparePassword(oldPassword); // Use the comparePassword method
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect.' });
    }

    // Update the password
    user.password = newPassword; // Assign the new password
    await user.save(); // Hashing will be handled by the pre-save middleware

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const changeUsername = async (req, res) => {
    try {
      const { newUsername } = req.body;
  
      // Validate input
      if (!newUsername) {
        return res.status(400).json({ message: 'New username is required.' });
      }
  
      // Extract user ID from the token
      const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
      if (!token) {
        return res.status(401).json({ message: 'Authorization token is missing.' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your JWT secret
      const userId = decoded.id; // Assuming the token payload contains `id`
  
      // Check if the new username is already taken
      const existingUser = await User.findOne({ username: newUsername });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken.' });
      }
  
      // Find the user by ID and update the username
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      user.username = newUsername;
      await user.save();
  
      res.status(200).json({ message: 'Username updated successfully.', username: user.username });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error.' });
    }
  };


module.exports = {
  changePassword,
  changeUsername,
};