const UserService = require('../services/userService');

const userController = {
    // GET /users?name=alice
    getUserByName: async (req, res) => {
        try {
            const name = req.query.name;
            if (!name) return res.status(400).send('Missing name query');

            const user = await UserService.getUserByName(name);
            res.json(user);
        } catch (err) {
            if (err.message === 'User not found') {
                res.status(404).send('User not found');
            } else {
                console.error(err);
                res.status(500).send('Error fetching user');
            }
        }
    },

    // DELETE /users/:id
    deleteUser: async (req, res) => {
        try {
            const id = req.params.id;
            await UserService.deleteUser(id);
            res.send('User deleted successfully');
        } catch (err) {
            if (err.message === 'User not found') {
                res.status(404).send('User not found');
            } else {
                console.error(err);
                res.status(500).send('Error deleting user');
            }
        }
    }
};

module.exports = userController;
