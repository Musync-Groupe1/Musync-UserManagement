const express = require('express');
const app = express();
const profileRoutes = require('./routes/profile');

app.use(express.json());
app.use('/user', profileRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));
