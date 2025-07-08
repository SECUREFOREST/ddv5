const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Placeholder routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/acts', require('./routes/acts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/credits', require('./routes/credits'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/switches', require('./routes/switches'));

app.get('/', (req, res) => {
  res.send('DDV5 API is running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 