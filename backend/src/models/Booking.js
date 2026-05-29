const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Experience = require('./Experience');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    experience_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Experience,
            key: 'id',
        },
    },
    tourist_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    seller_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    booking_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    booking_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    number_of_people: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    deposit_paid: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
        defaultValue: 'pending',
    },
    payment_method: {
        type: DataTypes.ENUM('stripe', 'yappy', 'cash'),
        allowNull: true,
    },
    special_requests: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// Relaciones
Experience.hasMany(Booking, { foreignKey: 'experience_id' });
Booking.belongsTo(Experience, { foreignKey: 'experience_id' });

User.hasMany(Booking, { foreignKey: 'tourist_id' });
Booking.belongsTo(User, { foreignKey: 'tourist_id' });

module.exports = Booking;