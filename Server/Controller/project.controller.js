import db from "../db/connection.js";

export async function client_name(req , res) {
    const user_id = req.user.user_id;
    try {
        const get_client_name_id = await db.query("SELECT client_name , id FROM public.client_data WHERE user_id = $1 ORDER BY client_name ASC" , [user_id]);
        const data = get_client_name_id.rows;
        

        return res.status(200).json({
            data : data,
            success : true , 
            message : "Client name fetched successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error getting client name"
        });
    }
}

export async function save_project(req , res) {
    const user_id = req.user.user_id;
    const client_id = req.body.client_id;
    const client_name = req.body.client_name;
    const project_name = req.body.project_name;
    const budget = req.body.budget;
    const priority = req.body.priority;
    const start_date = req.body.start_date;
    const end_date = req.body.end_date;
    const status = req.body.status;

    try {

        // Check if client_id belong to the user
        const check_client_id_query = await db.query("SELECT 1 FROM public.client_data WHERE id = $1 AND user_id = $2", [client_id , user_id]);

        if (check_client_id_query.rows.length == 0){
            return res.status(403).json({
                success : false,
                message : "Client didn't belong to this user"
            })
        }

        const existing_project = await db.query(
            "SELECT 1 FROM public.project_data WHERE client_id = $1 AND project_name = $2 AND budget = $3 AND priority = $4 AND start_date = $5 AND end_date = $6 AND status = $7 AND user_id = $8 LIMIT 1",
            [client_id , project_name , budget , priority , start_date , end_date , status , user_id]
        );

        if (existing_project.rowCount > 0) {
            return res.status(409).json({
                success : false,
                message : "Project data already exists"
            });
        }

        const save_data = await db.query(
            "INSERT INTO public.project_data (client_id, project_name, budget, priority, start_date, end_date, status, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            [client_id, project_name, budget, priority, start_date, end_date, status, user_id]
        );

        await db.query("INSERT INTO public.activity_log (user_id , activity_type , title , description) VALUES ($1 , $2 , $3 , $4)" , [user_id , "project_created" , "Project created" ,  `Project ${project_name} created for client ${client_name}`]);

        res.status(200).json({
            success : true,
            message : "Project data saved successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error in backend saving project data"
        });
    }
}


export async function get_project(req , res) {
    const user_id = req.user.user_id;
    try {
        const get_project = await db.query(
            "SELECT p.id, p.project_name, p.budget, p.priority, p.status, p.start_date, p.end_date, c.client_name FROM public.project_data p LEFT JOIN public.client_data c ON c.id = p.client_id WHERE p.user_id = $1 ORDER BY p.id ASC",
            [user_id]
        );


        const project_data = get_project.rows;

        return res.status(200).json({
            project_data : project_data,
            success : true,
            message : "Successfully fetched project data"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Failed to fetch project data"
        });
    }

}

export async function delete_project(req , res) {
    const user_id = req.user.user_id;
    const project_id = req.body.project_id;

    try {
        const delete_project_query = await db.query("DELETE FROM public.project_data WHERE id = $1 AND user_id = $2 RETURNING project_name" , [project_id , user_id] );

        const deleted_project = delete_project_query.rows[0].project_name;       

        await db.query("INSERT INTO public.activity_log (user_id , activity_type , title , description) VALUES ($1 , $2 , $3 , $4)" , [user_id , "project_deleted" , "Project deleted" ,  `Project ${deleted_project} deleted`]);

        return res.status(200).json({
            success : true,
            message : "Project deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Failed to delete project"
        });
    }
}


export async function task_data(req , res) {
    const user_id = req.user.user_id;
    const task = req.body.task ?? [];
    const project_id = req.body.project_id;

    if (!project_id) {
        return res.status(400).json({
            success: false,
            message: "Project id is required"
        });
    }

    try {
        const project_check = await db.query(
            "SELECT 1 FROM public.project_data WHERE id = $1 AND user_id = $2",
            [project_id, user_id]
        );

        if (project_check.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Project didn't belong to this user"
            });
        }

        await db.query("DELETE FROM public.project_task WHERE user_id = $1 AND project_id = $2", [user_id, project_id]);

        for (const item of task) {
            const task_name = item?.task_name ?? item?.task ?? '';
            const is_complete = Boolean(item?.complete ?? item?.is_complete ?? false);

            await db.query(
                "INSERT INTO public.project_task (user_id, project_id, task_name, is_complete) VALUES ($1, $2, $3, $4)",
                [user_id, project_id, task_name, is_complete]
            );
        }

        const project_name_query = await db.query("SELECT project_name FROM public.project_data WHERE id = $1 AND user_id = $2" , [project_id , user_id]);

        const project_name = project_name_query.rows[0].project_name;

        await db.query("INSERT INTO public.activity_log (user_id , activity_type , title , description) VALUES ($1 , $2 , $3 , $4)" , [user_id , "task_created" , "Task created" , `Task created for project ${project_name}`]);

        return res.status(200).json({
            success: true,
            message: "Tasks saved successfully"
        });
    } catch (error) {
        console.error("Trouble in task database operation", error);
        return res.status(500).json({
            success: false,
            message: "Failed to do task_db operations"
        });
    }
}

export async function get_task(req , res) {
    const user_id = req.user.user_id;
    const project_id = req.params.project_id;

    if (!project_id) {
        return res.status(400).json({
            success: false,
            message: "Project id is required"
        });
    }

    try {
        const get_task = await db.query(
            "SELECT id, task_name, is_complete FROM public.project_task WHERE user_id = $1 AND project_id = $2 ORDER BY id ASC",
            [user_id, project_id]
        );
        const task_array = get_task.rows.map((task) => ({
            id: task.id,
            task_name: task.task_name,
            is_complete: task.is_complete,
            complete: task.is_complete,
            task: task.task_name
        }));

        res.status(200).json({
            task_data: task_array,
            success: true,
            message: "Task fetched successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch task"
        });
    }
}

export async function update_task(req , res) {
    const user_id = req.user.user_id;
    const task_id = req.body.task_id;
    const task_complete = req.body.task_complete;
    try {
        const update_task = await db.query("UPDATE public.project_task SET is_complete = $1 WHERE id = $2 AND user_id = $3 RETURNING project_id " , [task_complete , task_id , user_id]);

        const project_id = update_task.rows[0].project_id;

        if (!project_id){
            return res.status(400).json({
                success : false,
                message : "Task doesn't belong to this user"
            })
        }

        const project_name_query = await db.query("SELECT project_name FROM public.project_data WHERE id = $1 AND user_id = $2" , [project_id , user_id]);

        const project_name = project_name_query.rows[0].project_name;

        await db.query("INSERT INTO public.activity_log (user_id , activity_type , title , description) VALUES ($1 , $2 , $3 , $4)" , [user_id , "task_updated" , "Task updated" , `Task updated for project ${project_name}`]);


        return res.status(200).json({
            success : true,
            message : "Task updated successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Failed to update task"
        });
    } 
}

export async function delete_task(req , res) {
    const user_id = req.user.user_id;
    const task_id = req.body.task_id;

    try {
        const delete_task = await db.query("DELETE FROM public.project_task WHERE id = $1 AND user_id = $2" , [task_id , user_id]);

        if(delete_task.rowCount == 0) {
            return res.status(400).json({
                success : false,
                message : "No valid task to delete"
            })
        }
        
        return res.status(200).json({
            success : true,
            message : "Task deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Failed to delete task"
        });
    }
}

