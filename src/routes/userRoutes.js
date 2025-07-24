const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /searchUser/users?name=xxx
router.get('/searchUser/', userController.getUserByName);

// DELETE /users/:id
router.delete('/:id', userController.deleteUser);


// Route to create a new user
router.post('/createUser', userController.createUser);

// Route to update a user by ID
router.put('/updateUser/:id', userController.updateUser);


module.exports = router;
