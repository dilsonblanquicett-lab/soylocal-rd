const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Seller = sequelize.define('Seller', {
    user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: User,
            key: 'id',
        },
    },
    business_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    business_description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    rating_avg: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 0,
    },
    total_reviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    is_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'sellers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

// Relación: Un usuario puede ser vendedor
User.hasOne(Seller, { foreignKey: 'user_id' });
Seller.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Seller;