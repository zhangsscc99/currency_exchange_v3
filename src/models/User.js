const { executeQuery } = require('../config/database');

const UserModel = {
    // Get ONE user by exact name
    getUserByName: async (name) => {
        const sql = 'SELECT * FROM users WHERE user_name = ? LIMIT 1';
        const results = await executeQuery(sql, [name]);
        return results[0]; // 只返回一个用户
    },

    // Delete user by ID
    deleteUserById: async (userId) => {
        const sql = 'DELETE FROM users WHERE user_id = ?';
        const result = await executeQuery(sql, [userId]);
        return result;
    }
};

module.exports = UserModel;
