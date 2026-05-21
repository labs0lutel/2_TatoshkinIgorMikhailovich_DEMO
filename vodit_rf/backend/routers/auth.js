const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.post('/register', async (req, res) => {
    const {login, password, full_name, birth_date, phone, email} = req.body;

    if (!/^[a-zA-Z0-9]{6,}$/.test(login)){
        return res.status(400).json({message: 'Логин: латиница и цифры, минимум 6 символов'});
    }
    if(password.length < 8){
        return res.status(400).json({message: 'Пароль: минимум 8 символов'});
    }

    try{
        const exists = await pool.query('SELECT id FROM users WHERE login = $1', [login]);
        if (exists.row.length > 0){
            return res.status(400).json({message: 'Логин уже занят'})
        }

        const hash = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (login, password, full_name, birth_date, phone, email) VALUES ($1, $2, $3, $4, $5, $6)',
            [login, hash, full_name, birth_date, phone, email]
        );
        res.json({message: 'Регистрация успешна'});
    } catch (err){
        res.status(500).json({message: 'Ошибка сервера', error: err.message});
    }
});

router.post('/login', async (req, res) => {
    const {login, password} = req.body;
    try{
        const result = await pool.query('SELECT * FROM users WHERE login = $1', [login]);
        if (result.rows.length === 0 ){
            return res.status(400).json({message: 'Неверный логин или пароль'})
        }
        const user = result.row[0];
        const valid = await bcrypt.compare(password, user.password);
        if(!valid) return res.status(400).json({message: 'Неверный логин или пароль'});

        const token = jwt.sign({id: user.id, role: 'user'}, process.env.JWT_SECRET, {expiresIn: '8h'});
        res.json({token, user: {id: user.id, login: user.login, full_name: user.full_name}  });
    }catch (err){
        res.status(500).json({message: 'Ошибка сервера'});
    }
});

router.post('/admin/login', async (req, res) => {
    const {login, password} = req.body;
    try{
        const result = await pool.query('SELECT * FROM admins WHERE login = $1', [login]);
        if (result.rows.length === 0 ){
            return res.status(400).json({message: 'Неверный логин или пароль'});
        }
        const admin = result.rows[0];
        if (admin.password !== password){
            return res.status(400).json({message: 'Неверный логин или пароль'});
        }
        const token = jwt.sign({id: admin.id, role: 'admin'}, process.env.JWT_SECRET, {expiresIn: '8h'});
        res.json({token})
    }catch(err){
        res.status(500).json({message: 'Ошибка сервера'});
    }
});

module.exports = router;