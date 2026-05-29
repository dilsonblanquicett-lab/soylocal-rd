const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    user_type: {
        type: DataTypes.ENUM('tourist', 'seller', 'admin'),
        defaultValue: 'tourist',
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

// Hash password antes de guardar
User.beforeCreate(async (user) => {
    if (user.password_hash) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
    }
});

// Método para comparar password
User.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
};

// Método para datos públicos (sin información sensible)
User.prototype.toPublicJSON = function() {
    return {
        id: this.id,
        email: this.email,
        full_name: this.full_name,
        phone: this.phone,
        user_type: this.user_type,
        is_active: this.is_active,
        created_at: this.created_at,
    };
};

module.exports = User;