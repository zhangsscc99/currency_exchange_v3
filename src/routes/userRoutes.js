const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// GET /searchUser/users?name=xxx
router.get('/searchUser/', UserController.getUserByName);

// DELETE /users/:id
router.delete('/:id', UserController.deleteUser);

module.exports = router;
