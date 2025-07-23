const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// GET /users?name=xxx
router.get('/', UserController.getUserByName);

// DELETE /users/:id
router.delete('/:id', UserController.deleteUser);

module.exports = router;
