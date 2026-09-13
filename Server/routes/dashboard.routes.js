import express from 'express';
import authmiddleware from '../auth_middleware.js';
import {get_needs_attention , get_recent_activity} from '../Controller/dashboard.controller.js';

const router = express.Router();

router.get('/get_needs_attention' , authmiddleware , get_needs_attention);

router.get('/get_recent_activity' , authmiddleware , get_recent_activity)

export default router;