const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const authController = {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Перевірка існування користувача
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });

      if (existingUser) {
        return res.status(400).json({ 
          message: 'Користувач з таким email або username вже існує' 
        });
      }

      // Створення нового користувача
      const user = new User({ username, email, password });
      await user.save();

      // Генерація токену
      const token = generateToken(user);

      res.status(201).json({ 
        message: 'Реєстрація успішна', 
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Помилка реєстрації', 
        error: error.message 
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Пошук користувача
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(401).json({ 
          message: 'Невірний email або пароль' 
        });
      }

      // Перевірка паролю
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        return res.status(401).json({ 
          message: 'Невірний email або пароль' 
        });
      }

      // Генерація токену
      const token = generateToken(user);

      res.json({ 
        message: 'Вхід успішний', 
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Помилка входу', 
        error: error.message 
      });
    }
  }
};

module.exports = authController;