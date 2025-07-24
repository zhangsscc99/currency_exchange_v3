const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Route to create a new user
router.post('/createUser', userController.createUser);

// Route to update a user by ID
router.put('/updateUser/:id', userController.updateUser);


module.exports = router;