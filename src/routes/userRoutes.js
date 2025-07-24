const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// GET /searchUser/users?name=xxx
router.get('/searchUser/', UserController.getUserByName);

// DELETE /users/:id
router.delete('/:id', UserController.deleteUser);


// Route to create a new user
router.post('/createUser', userController.createUser);

// Route to update a user by ID
router.put('/updateUser/:id', userController.updateUser);


module.exports = router;
