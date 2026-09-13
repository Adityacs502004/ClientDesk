import express from 'express';
import authmiddleware from "../auth_middleware.js";
const router = express.Router();
import { createClient } from '../Controller/client.controller.js';
import { get_client , delete_client , update_client, get_client_invoices, reassign_invoices, bulk_delete_invoices } from '../Controller/client.controller.js';

router.post("/save_client_data",authmiddleware, createClient);
router.get('/get_client' , authmiddleware, get_client);
router.post('/delete_client' , authmiddleware , delete_client);
router.get('/get_invoices/:client_id', authmiddleware, get_client_invoices);
router.post('/reassign_invoices', authmiddleware, reassign_invoices);
router.post('/bulk_delete_invoices', authmiddleware, bulk_delete_invoices);
router.post('/update_client' , authmiddleware  , update_client);

export default router


