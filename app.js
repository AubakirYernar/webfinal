require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Модели
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  images: [String],
  isAdmin: { type: Boolean, default: false }, // Добавьте это поле
  emailToken: String,
  isVerified: { type: Boolean, default: false }
});

const TodoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);
const Todo = mongoose.model('Todo', TodoSchema);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
const upload = multer();
app.use(cookieParser());

// JWT Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token; // Получаем токен только из куки
    if (!token) return res.redirect('/login');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);
    
    if (!req.user) throw new Error('Пользователь не найден');
    next();
    
  } catch (err) {
    res.clearCookie('token');
    res.redirect('/login');
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).send('Access denied');
  }
};

// Создаем администратора при запуске приложения
async function createAdmin() {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('123', 10);
      const admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        isAdmin: true
      });
      await admin.save();
      console.log('✅ Администратор создан');
    }
  } catch (err) {
    console.error('❌ Ошибка при создании администратора:', err);
  }
}
createAdmin();  

// Маршруты
app.get('/', (req, res) => res.render('index'));

// Auth Routes
app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).render('login', { error: 'Неверные данные' });
    }

    // Генерируем токен
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Устанавливаем куки с токеном
    res.cookie('token', token, { 
      httpOnly: true,
      maxAge: 3600000 // 1 час
    });
    
    // Перенаправляем на страницу пользователя
    res.redirect('/user');
    
  } catch (err) {
    res.status(500).render('login', { error: 'Ошибка сервера' });
  }
});

app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    res.status(400).render('register', { error: 'Registration failed' });
  }
});

// User Routes
app.get('/user', authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id });
    res.render('user', { 
      user: req.user,
      todos: todos.map(todo => todo.toObject())
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.post('/user/change-password', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!await bcrypt.compare(req.body.oldPassword, user.password)) {
      return res.render('user', { error: 'Old password incorrect' });
    }

    user.password = await bcrypt.hash(req.body.newPassword, 10);
    await user.save();
    res.redirect('/user');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.post('/user/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.images.push(req.file.buffer.toString('base64'));
    await user.save();
    res.redirect('/user');
  } catch (err) {
    res.status(500).send('Error uploading image');
  }
});

// Todo Routes
app.post('/user/todos', authMiddleware, async (req, res) => {
  try {
    const todo = new Todo({
      user: req.user._id,
      title: req.body.title,
      description: req.body.description
    });
    await todo.save();
    res.redirect('/user');
  } catch (err) {
    res.status(400).render('user', { error: 'Error creating todo' });
  }
});

app.post('/user/todos/:id/delete', authMiddleware, async (req, res) => {
  try {
    await Todo.deleteOne({ _id: req.params.id, user: req.user._id });
    res.redirect('/user');
  } catch (err) {
    res.status(500).send('Error deleting todo');
  }
});

app.post('/user/todos/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    todo.completed = !todo.completed;
    await todo.save();
    res.redirect('/user');
  } catch (err) {
    res.status(500).send('Error updating todo');
  }
});

// Admin Routes
app.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}).populate('todos');
    const todos = await Todo.find().populate('user');
    res.render('admin', { users, todos });
  } catch (err) {
    res.status(500).send('Server error');
  }
});
app.post('/admin/create', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });
    await user.save();
    res.redirect('/admin');
  } catch (err) {
    res.status(400).send('Error creating user');
  }
});

app.post('/admin/update-user/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }
    user.isAdmin = req.body.isAdmin === 'on';
    await user.save();
    res.redirect('/admin');
  } catch (err) {
    res.status(500).send('Error updating user');
  }
});

app.post('/admin/delete-user/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Todo.deleteMany({ user: req.params.id });
    res.redirect('/admin');
  } catch (err) {
    res.status(500).send('Error deleting user');
  }
});

app.post('/admin/delete-todo/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    res.status(500).send('Error deleting todo');
  }
});

// Logout
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));