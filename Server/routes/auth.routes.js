import express from 'express';
import authmiddleware from '../auth_middleware.js';
import {google_login} from '../Controller/auth.controller.js'

const router = express.Router();

router.post("/auth/google" , google_login);

export default router