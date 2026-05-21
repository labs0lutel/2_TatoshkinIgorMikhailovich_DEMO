const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/authMidleware');

router.post('/', auth, async (req, res) => {
  const { application_id, text } = req.body;
  try {
    const app = await pool.query(
      'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
      [application_id, req.user.id]
    );
    if (app.rows.length === 0) return res.status(404).json({ message: 'Заявка не найдена' });
    if (app.rows[0].status === 'Новая') {
      return res.status(403).json({ message: 'Отзыв можно оставить только после изменения статуса' });
    }
    await pool.query(
      'INSERT INTO reviews (user_id, application_id, text) VALUES ($1,$2,$3)',
      [req.user.id, application_id, text]
    );
    res.json({ message: 'Отзыв добавлен' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
