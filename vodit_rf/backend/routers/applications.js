const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/authMidleware');

router.get('/my', auth, async (req, res) => {
    try { 
        const result = await pool.query(
            `SELECT a.*, t.name AS transport_name, p.name AS payment_name
            FROM applications a
            JOIN transport_types t ON a.transport_type_id = t.id
            JOIN payment_methods p ON a.payment_method_id = p.id
            WHERE a.user_id = $1
            ORDER BY a.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    }catch(err){
        res.status(500).json({message: 'Ошибка сервера'});
    }
});

router.post('/', auth, async (req, res) => {
    const {transport_type_id, payment_method_id, start_date} = req.body;
    try{
        await pool.query(
            'INSERT INTO applications (user_id, transport_type_id, payment_method_id, start_date) VALUES ($1,$2,$3,$4)',
            [req.user.id, transport_type_id, payment_method_id, start_date]
        );
        res.json({message: 'Заявка создана'});
    } catch (err){
        res.status(500).json({message: 'Ошибка сервера'});
    }
});

router.get('/transport-types', async (req, res) => {
    const result = await pool.query('SELECT * FROM transport_types');
    res.json(result.rows);
});

router.get('/payment_methods', async (req, res) => {
    const result = await pool.query('SELECT * FROM payment_methods');
    res.json(result.rows);
});

module.exports = router;
