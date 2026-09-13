import authmiddleware from "../auth_middleware.js";
import db from "../db/connection.js";


export async function createClient(req , res){
    // code
    const {name , email , status , tags} = req.body;
    const user_id = req.user.user_id;
    if (name && email){
        try {
            const store_client = await db.query("INSERT INTO public.client_data (user_id , client_name , email , status , tags) VALUES ($1, $2 , $3 , $4 , $5)" , [user_id , name , email , status ,tags]);

            await db.query("INSERT INTO public.activity_log (user_id , activity_type , title , description) VALUES ($1 , $2 , $3 , $4)" , [user_id , "client_created" , "Client added" , name]);
        } catch (error) {
            return res.status(500).json({
                success : false,
                message : "Error storing client in db"
            })
        }
        return res.status(200).json({
            success : true,
            message : "client saved successfully"
        })
        
    }

    

}


export async function get_client(req , res){
    const user_id = req.user.user_id;

    let client_data;
    try {
        const get_client = await db.query(
            `SELECT
                c.id,
                c.user_id,
                c.client_name AS name,
                c.email,
                c.status,
                c.tags,
                c.created_at,
                COALESCE(outstanding.total_outstanding, 0) AS "Outstanding"
             FROM public.client_data AS c
             LEFT JOIN (
                SELECT
                    client_id,
                    SUM(total_amount) AS total_outstanding
                FROM public.invoice_data
                WHERE user_id = $1 AND status IN ('Sent', 'Overdue')
                GROUP BY client_id
             ) AS outstanding ON outstanding.client_id = c.id
             WHERE c.user_id = $1
             ORDER BY c.client_name ASC`,
            [user_id]
        );
        client_data = get_client.rows;
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error getting client data"
        });
    }
    return res.status(200).json({
        data : client_data,
        success : true,
        message : "Client data fetched successfully"
    })
}

export async function delete_client(req, res) {
    const user_id = req.user.user_id;
    const client_id = req.body.client_id;

    if (client_id) {
        try {
        // Check for related invoices to avoid foreign-key violation
        const invoice_check = await db.query("SELECT id FROM public.invoice_data WHERE client_id = $1 AND user_id = $2 LIMIT 1", [client_id, user_id]);
        if (invoice_check.rows && invoice_check.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Client has invoices. Delete or reassign invoices before deleting the client.'
            });
        }

        const delete_client = await db.query("DELETE FROM public.client_data WHERE id = $1 AND user_id = $2 RETURNING client_name", [client_id, user_id]);

        if (!delete_client.rows || delete_client.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Client not found or not authorized' });
        }

        const client_name = delete_client.rows[0].client_name;

        await db.query("INSERT INTO public.activity_log (user_id , activity_type , title , description) VALUES ($1 , $2 , $3 , $4)",  [user_id , "client_deleted" , "Client deleted" , client_name]);
        } catch (error) {
        console.error("Error deleting client:", error);
         return res.status(500).json({
            success : false,
            message : error?.message || "Error deleting client"
        })
        }
    } else {
        return res.status(500).json({
            success : false,
            message : "No Client_id recieved"
        })
    }
    
    

    return res.status(200).json({
        success : true,
        message : "Client deleated successfully"
    });

    
}

export async function get_client_invoices(req, res) {
    const user_id = req.user.user_id;
    const client_id = req.params.client_id;

    try {
        const invoices_query = await db.query(
            `SELECT id, invoice_number, status, to_char(issue_date, 'DD-MM-YYYY') AS issue_date, total_amount
             FROM public.invoice_data
             WHERE client_id = $1 AND user_id = $2
             ORDER BY id DESC`,
            [client_id, user_id]
        );

        return res.status(200).json({
            success: true,
            invoices: invoices_query.rows
        });
    } catch (error) {
        console.error('Error fetching client invoices:', error);
        return res.status(500).json({ success: false, message: 'Error fetching client invoices' });
    }
}

export async function reassign_invoices(req, res) {
    const user_id = req.user.user_id;
    const { invoice_ids, to_client_id } = req.body;

    if (!Array.isArray(invoice_ids) || invoice_ids.length === 0 || !to_client_id) {
        return res.status(400).json({ success: false, message: 'Missing invoice_ids or to_client_id' });
    }

    try {
        const client_check = await db.query(
            "SELECT 1 FROM public.client_data WHERE id = $1 AND user_id = $2",
            [to_client_id, user_id]
        );

        if (client_check.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Target client not found or not authorized'
            });
        }

        const update_query = await db.query(
            'UPDATE public.invoice_data SET client_id = $1 WHERE id = ANY($2) AND user_id = $3 RETURNING id, invoice_number',
            [to_client_id, invoice_ids, user_id]
        );

        return res.status(200).json({ success: true, updated: update_query.rows });
    } catch (error) {
        console.error('Error reassigning invoices:', error);
        return res.status(500).json({ success: false, message: 'Error reassigning invoices' });
    }
}

export async function bulk_delete_invoices(req, res) {
    const user_id = req.user.user_id;
    const { invoice_ids } = req.body;

    if (!Array.isArray(invoice_ids) || invoice_ids.length === 0) {
        return res.status(400).json({ success: false, message: 'Missing invoice_ids' });
    }

    try {
        // Delete related items first to avoid FK constraints
        await db.query('DELETE FROM public.invoice_items WHERE invoice_id = ANY($1) AND user_id = $2', [invoice_ids , user_id]);
        const delete_query = await db.query('DELETE FROM public.invoice_data WHERE id = ANY($1) AND user_id = $2 RETURNING invoice_number', [invoice_ids, user_id]);

        const deleted = delete_query.rows || [];

        // Log each deletion into activity log
        for (const row of deleted) {
            await db.query('INSERT INTO public.activity_log (user_id, activity_type, title, description) VALUES ($1,$2,$3,$4)', [user_id, 'invoice_deleted', 'Invoice deleted', `Invoice ${row.invoice_number} deleted`]);
        }

        return res.status(200).json({ success: true, deleted });
    } catch (error) {
        console.error('Error bulk deleting invoices:', error);
        return res.status(500).json({ success: false, message: 'Error deleting invoices' });
    }
}

export async function update_client(req , res) {
    const user_id = req.user.user_id;
    const client_id = req.body.client_id;
    const {name , email , status , tags} = req.body;

    if (client_id) {
        try {
            const update_client = await db.query("UPDATE public.client_data SET client_name = $1 , email = $2, status = $3, tags = $4 WHERE id = $5 AND user_id = $6" , [name , email , status , tags , client_id , user_id]);
        } catch (error) {
            return res.status(500).json({
                success : false,
                message : "Error updating the client"
            })
        }
    } else {
        return res.status(400).json({
            success : false,
            message : "Didn't get client_id"
        })
    }

    return res.status(200).json({
        success : true,
        message : "Client updated successfully"
    })
}
    
