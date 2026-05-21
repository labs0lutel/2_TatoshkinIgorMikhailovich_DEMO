const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/authMidleware');

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Нет доступа' });
  next();
};

router.get('/applications', auth, adminOnly, async (req, res) => {
  const { status, page = 1, limit = 10, sort = 'created_at', order = 'DESC' } = req.query;
  const offset = (page - 1) * limit;
  try {
    let query = `SELECT a.*, u.full_name, u.login, t.name AS transport_name, p.name AS payment_name
                 FROM applications a
                 JOIN users u ON a.user_id = u.id
                 JOIN transport_types t ON a.transport_type_id = t.id
                 JOIN payment_methods p ON a.payment_method_id = p.id`;
    const params = [];
    if (status) {
      params.push(status);
      query += ` WHERE a.status = $${params.length}`;
    }
    query += ` ORDER BY a.${sort} ${order} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const count = await pool.query('SELECT COUNT(*) FROM applications' + (status ? ' WHERE status = $1' : ''), status ? [status] : []);
    res.json({ data: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
});

router.patch('/applications/:id/status', auth, adminOnly, async (req, res) => {
  const { status } = req.body;
  const allowed = ['Новая', 'Идет обучение', 'Обучение завершено'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Недопустимый статус' });
  try {
    await pool.query('UPDATE applications SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ message: 'Статус обновлён' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
