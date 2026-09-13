import express from 'express';
import authmiddleware from '../auth_middleware.js';
import { client_name, save_project , get_project, task_data , get_task , update_task ,delete_task , delete_project} from '../Controller/project.controller.js';

const router = express.Router();

router.get('/get_client_name' , authmiddleware , client_name);

router.post('/save_project' , authmiddleware , save_project);

router.get('/get_project' , authmiddleware , get_project);

router.post('/send_task' , authmiddleware , task_data);

router.get('/get_task/:project_id' , authmiddleware , get_task);

router.post('/delete_project' , authmiddleware , delete_project);

router.post('/update_task' , authmiddleware , update_task);

router.post('/delete_task' , authmiddleware , delete_task);

export default router