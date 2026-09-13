import express from 'express';
import authmiddleware from "../auth_middleware.js";
import { get_client , get_project , Save_invoice , get_invoice, get_items , download_invoice_pdf , send_invoice , mark_sent , mark_as_paid , cancel_invoice , delete_invoice  , get_amount_by_status , get_outstanding , this_month_payment} from '../Controller/invoice.controller.js';

const router = express.Router();

router.get('/get_client' , authmiddleware , get_client);

router.get('/get_project/:client_id' , authmiddleware , get_project);

router.post('/send_data' , authmiddleware , Save_invoice);

router.get('/get_invoice'  ,authmiddleware , get_invoice);

router.get('/get_items/:invoice_id' , authmiddleware , get_items);

router.get('/download_pdf/:invoice_id' , authmiddleware , download_invoice_pdf);

router.post('/send_invoice' , authmiddleware , send_invoice);

router.post('/mark_sent' , authmiddleware , mark_sent);

router.post('/mark_paid' , authmiddleware , mark_as_paid);

router.post('/cancel' , authmiddleware , cancel_invoice);

router.post('/delete_invoice' , authmiddleware , delete_invoice);

router.post('/get_amount_by_status' , authmiddleware , get_amount_by_status);

router.get("/get_outstanding" , authmiddleware , get_outstanding);

router.get("/this_month_payment" , authmiddleware , this_month_payment);




export default router;