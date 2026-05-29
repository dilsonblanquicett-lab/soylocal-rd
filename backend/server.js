const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Importar modelos y base de datos
const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const Seller = require('./src/models/Seller');
const { authMiddleware, isSeller } = require('./src/middleware/auth');

// ============================================
// RUTAS PÚBLICAS
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'SoyLocal RD funcionando' });
});

// Registro de turista
app.post('/api/auth/register-tourist', async (req, res) => {
    try {
        const { email, full_name, phone, password } = req.body;
        
        // Verificar si ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'El email ya está registrado' 
            });
        }
        
        const user = await User.create({
            email,
            full_name,
            phone,
            user_type: 'tourist',
            password_hash: password,
        });
        
        // Generar token JWT
        const token = jwt.sign(
            { id: user.id, user_type: user.user_type },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        
        res.json({ 
            success: true, 
            token,
            user: user.toPublicJSON()
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Registro de vendedor
app.post('/api/auth/register-seller', async (req, res) => {
    try {
        const { email, full_name, phone, password, business_name, business_description } = req.body;
        
        // Verificar si ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'El email ya está registrado' 
            });
        }
        
        // Crear usuario
        const user = await User.create({
            email,
            full_name,
            phone,
            user_type: 'seller',
            password_hash: password,
        });
        
        // Crear perfil de vendedor
        await Seller.create({
            user_id: user.id,
            business_name,
            business_description,
            is_approved: false, // Requiere aprobación manual
        });
        
        // Generar token JWT
        const token = jwt.sign(
            { id: user.id, user_type: user.user_type },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        
        res.json({ 
            success: true, 
            token,
            user: user.toPublicJSON(),
            message: 'Registro exitoso. Tu cuenta está pendiente de aprobación.'
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Buscar usuario
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciales inválidas' 
            });
        }
        
        // Verificar contraseña
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciales inválidas' 
            });
        }
        
        // Generar token
        const token = jwt.sign(
            { id: user.id, user_type: user.user_type },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        
        res.json({ 
            success: true, 
            token,
            user: user.toPublicJSON()
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

// Obtener mi perfil
app.get('/api/auth/me', authMiddleware, async (req, res) => {
    res.json({ success: true, user: req.user.toPublicJSON() });
});

// Listar usuarios (solo para prueba)
app.get('/api/users', async (req, res) => {
    const users = await User.findAll({
        attributes: ['id', 'email', 'full_name', 'phone', 'user_type', 'is_active', 'created_at']
    });
    res.json({ success: true, users });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const startServer = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('✅ Base de datos sincronizada');
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log(`📋 RUTAS DISPONIBLES:`);
            console.log(`   POST   /api/auth/register-tourist`);
            console.log(`   POST   /api/auth/register-seller`);
            console.log(`   POST   /api/auth/login`);
            console.log(`   GET    /api/auth/me (requiere token)`);
            console.log(`   GET    /api/users`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar:', error.message);
    }
};

// Importar modelo Experience
const Experience = require('./src/models/Experience');

const Booking = require('./src/models/Booking');

// ============================================
// RUTAS DE EXPERIENCIAS (protegidas)
// ============================================

// Crear experiencia (solo vendedores)
app.post('/api/experiences', authMiddleware, isSeller, async (req, res) => {
    try {
        const seller = await Seller.findOne({ where: { user_id: req.userId } });
        if (!seller || !seller.is_approved) {
            return res.status(403).json({ 
                success: false, 
                message: 'Tu cuenta de vendedor no está aprobada aún' 
            });
        }

        const experience = await Experience.create({
            seller_id: req.userId,
            ...req.body
        });

        res.json({ success: true, experience });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Listar todas las experiencias activas (público)
app.get('/api/experiences', async (req, res) => {
    try {
        const { city, category } = req.query;
        let where = { status: 'active' };
        
        if (city) where.city = city;
        if (category) where.category = category;

        const experiences = await Experience.findAll({ where });
        res.json({ success: true, experiences });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Obtener una experiencia por ID
app.get('/api/experiences/:id', async (req, res) => {
    try {
        const experience = await Experience.findByPk(req.params.id);
        if (!experience) {
            return res.status(404).json({ success: false, message: 'Experiencia no encontrada' });
        }
        res.json({ success: true, experience });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Actualizar experiencia (solo el vendedor dueño)
app.put('/api/experiences/:id', authMiddleware, isSeller, async (req, res) => {
    try {
        const experience = await Experience.findOne({ 
            where: { id: req.params.id, seller_id: req.userId } 
        });
        
        if (!experience) {
            return res.status(404).json({ success: false, message: 'Experiencia no encontrada' });
        }

        await experience.update(req.body);
        res.json({ success: true, experience });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Eliminar experiencia (solo el vendedor dueño)
app.delete('/api/experiences/:id', authMiddleware, isSeller, async (req, res) => {
    try {
        const experience = await Experience.findOne({ 
            where: { id: req.params.id, seller_id: req.userId } 
        });
        
        if (!experience) {
            return res.status(404).json({ success: false, message: 'Experiencia no encontrada' });
        }

        await experience.update({ status: 'deleted' });
        res.json({ success: true, message: 'Experiencia eliminada' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ============================================
// RUTAS DE RESERVAS (protegidas)
// ============================================

// Crear reserva (turista autenticado)
app.post('/api/bookings', authMiddleware, async (req, res) => {
    try {
        const { experience_id, booking_date, booking_time, number_of_people, special_requests } = req.body;
        
        // Verificar que la experiencia existe y está activa
        const experience = await Experience.findOne({ 
            where: { id: experience_id, status: 'active' } 
        });
        
        if (!experience) {
            return res.status(404).json({ 
                success: false, 
                message: 'Experiencia no disponible' 
            });
        }
        
        // Calcular total
        const total_amount = parseFloat(experience.price) * number_of_people;
        const deposit_paid = total_amount * 0.2; // 20% de seña
        
        // Crear reserva
        const booking = await Booking.create({
            experience_id,
            tourist_id: req.userId,
            seller_id: experience.seller_id,
            booking_date,
            booking_time,
            number_of_people,
            total_amount,
            deposit_paid,
            special_requests,
            status: 'confirmed',
            payment_method: 'cash', // Por ahora efectivo, luego Stripe
        });
        
        res.json({ 
            success: true, 
            message: `Reserva confirmada. Seña del 20%: $${deposit_paid}. Resto a pagar en efectivo: $${total_amount - deposit_paid}`,
            booking
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Listar mis reservas (turista autenticado)
app.get('/api/bookings/my-bookings', authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { tourist_id: req.userId },
            include: [
                { model: Experience, attributes: ['title', 'city', 'price'] }
            ],
            order: [['created_at', 'DESC']]
        });
        
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Listar reservas de mis experiencias (vendedor)
app.get('/api/bookings/seller-bookings', authMiddleware, isSeller, async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { seller_id: req.userId },
            include: [
                { model: Experience, attributes: ['title', 'city'] },
                { model: User, attributes: ['full_name', 'email', 'phone'] }
            ],
            order: [['created_at', 'DESC']]
        });
        
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Cancelar reserva (turista)
app.put('/api/bookings/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            where: { id: req.params.id, tourist_id: req.userId }
        });
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: 'Reserva no encontrada' 
            });
        }
        
        if (booking.status !== 'confirmed') {
            return res.status(400).json({ 
                success: false, 
                message: 'Esta reserva no se puede cancelar' 
            });
        }
        
        await booking.update({ status: 'cancelled' });
        
        res.json({ 
            success: true, 
            message: 'Reserva cancelada. La seña no es reembolsable.' 
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

startServer()