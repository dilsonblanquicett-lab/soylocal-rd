const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No hay token, autorización denegada' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        
        if (!user || !user.is_active) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuario no válido' 
            });
        }

        req.user = user;
        req.userId = user.id;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Token inválido o expirado' 
        });
    }
};

const isSeller = (req, res, next) => {
    if (req.user.user_type !== 'seller') {
        return res.status(403).json({ 
            success: false, 
            message: 'Acceso solo para vendedores' 
        });
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (req.user.user_type !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Acceso solo para administradores' 
        });
    }
    next();
};

module.exports = { authMiddleware, isSeller, isAdmin };