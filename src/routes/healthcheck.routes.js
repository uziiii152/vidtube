
import express from 'express';
import { healthCheck } from '../controller/healthcheck.controller.js'; // Import your controller

const router = express.Router(); // Initialize the router correctly

console.log(healthCheck); // To check if the function is correctly imported

// Use the imported controller function for the route
router.route('/').get(healthCheck);

export default router; // Export the router instance
