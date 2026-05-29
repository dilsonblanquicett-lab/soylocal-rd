const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Seller = require('./Seller');

const Experience = sequelize.define('Experience', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    seller_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Seller,
            key: 'user_id',
        },
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    category: {
        type: DataTypes.ENUM('clase', 'tour', 'gastronomia', 'arte', 'bienestar', 'transporte'),
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    location_details: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
    },
    duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
    },
    max_people: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    whats_included: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: [],
    },
    images: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: [],
    },
    main_image: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'paused', 'deleted'),
        defaultValue: 'active',
    },
}, {
    tableName: 'experiences',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

Seller.hasMany(Experience, { foreignKey: 'seller_id' });
Experience.belongsTo(Seller, { foreignKey: 'seller_id' });

module.exports = Experience;