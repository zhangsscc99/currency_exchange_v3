const UserModel = require('../models/User');

const UserService = {
    getUserByName: async (name) => {
        const user = await UserModel.getUserByName(name);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    },

    deleteUser: async (userId) => {
        const result = await UserModel.deleteUserById(userId);
        if (result.affectedRows === 0) {
            throw new Error('User not found');
        }
        return result;
    }
};

module.exports = UserService;
