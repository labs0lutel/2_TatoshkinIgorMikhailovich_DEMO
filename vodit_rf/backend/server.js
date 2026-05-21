const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routers/auth'));
app.use('/api/applications', require('./routers/applications'));
app.use('/api/reviews', require('./routers/reviews'));
app.use('/api/admin', require('./routers/admin'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
