import db from "../db/connection.js";

export async function get_needs_attention(req , res) {
    const user_id = req.user.user_id;
    const today = new Date().toLocaleDateString('sv');

    try {
        const needs_attention_query = await db.query("SELECT id FROM public.invoice_data WHERE user_id = $1 AND status = $2 AND due_date < CURRENT_DATE", [user_id , "Sent"]);

        const query_response = needs_attention_query.rows;

        const project_deadline_query = await db.query("SELECT id FROM public.project_data WHERE user_id = $1 AND end_date < CURRENT_DATE", [user_id]);

        const project_response = project_deadline_query.rows;

        const draft_query =  await db.query("SELECT id FROM public.invoice_data WHERE user_id = $1 AND status = $2", [user_id , "Draft"]);

        const draft_response = draft_query.rows;

        const lead_client_query = await db.query("SELECT id FROM public.client_data WHERE status = $1 AND user_id = $2", ["Lead" , user_id]);

        const lead_client_response = lead_client_query.rows;


        return res.status(200).json({
            invoice_overdue : query_response,
            project_deadline : project_response,
            draft_query : draft_response,
            lead_client : lead_client_response,
            success: true,
            message: "Needs attention data is not implemented yet"     
    });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error setting up attention dilouge box"
        })
    }   
}

export async function get_recent_activity(req , res) {
    const user_id = req.user.user_id;

    try {
        const get_activity_query = await db.query("SELECT * FROM public.activity_log WHERE user_id = $1 LIMIT 10" , [user_id]);
        const activity_data = get_activity_query.rows;
        res.status(200).json({
            activity : activity_data,
            success : true ,
            message : "Activity data fetched successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error fetching activity data from db"
        })
    }
}