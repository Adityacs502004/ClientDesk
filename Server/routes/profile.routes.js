import express from 'express';
import authmiddleware from '../auth_middleware.js';
import { upload } from '../mutler.middleware.js';
import { save_payment_meathod , get_payment_meathods , delete_payment_meathod, set_meathod_as_default , save_data , get_user_invoicing , get_profile_pic , get_user_details , save_changes} from '../Controller/profile.controller.js';
import multer from 'multer';

const router = express.Router();

router.post('/payment_method' , authmiddleware , save_payment_meathod);

router.get('/get_meathods' , authmiddleware , get_payment_meathods);

router.post('/delete_meathod' , authmiddleware , delete_payment_meathod);

router.post('/setdefault' , authmiddleware , set_meathod_as_default);

router.post('/save_data' , authmiddleware , upload.single("signature") , save_data);

router.get('/get_user_invoicing' , authmiddleware , get_user_invoicing);

// Profile section

router.get('/get_profile_pic' , authmiddleware , get_profile_pic);

router.get('/get_user_details' , authmiddleware , get_user_details);

router.post('/save_changes' , authmiddleware , upload.single("profile_pic") ,  save_changes);


export default router;