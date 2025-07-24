const express = require('express');
const userService = require('../services/userService');

const userController = {
    // GET /users?name=alice
    getUserByName: async (req, res) => {
        try {
            const name = req.query.name;
            if (!name) return res.status(400).send('Missing name query');

            const user = await userService.getUserByName(name);
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
            await userService.deleteUser(id);
            res.send('User deleted successfully');
        } catch (err) {
            if (err.message === 'User not found') {
                res.status(404).send('User not found');
            } else {
                console.error(err);
                res.status(500).send('Error deleting user');
            }
        }
    },

    // POST /users
    createUser: async (req, res) => {
        try {
            const userData = req.body;
            const newUser = await userService.createUser(userData);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // PUT /users/:id
    updateUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const updatedData = req.body;
            const updatedUser = await userService.updateUser(userId, updatedData);
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};

module.exports = userController;
