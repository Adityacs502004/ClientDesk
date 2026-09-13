import db from "../db/connection.js";
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD
    }
});


export async function get_client(req , res) {
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
            message : "Error getting client name (invoice)"
        });
    }
}


export async function get_project(req , res) {
    const user_id = req.user.user_id;
    const client_id = req.params.client_id;

    try {
        const project_query = await db.query("SELECT project_name , id FROM public.project_data WHERE client_id = $1 AND user_id = $2" , [client_id , user_id]);
        const project_data = project_query.rows;

        return res.status(200).json({
            project : project_data,
            success : true ,
            message : "Project for the specific client is fetched successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error getting project data from the db"
        });
    }
}



export async function Save_invoice(req , res) {
    const user_id = req.user.user_id;
    const {client_id , project_id , issue_date , due_date , total_amount , notes} = req.body;
    const items = req.body.items;
    const status = req.body?.status ?? "";

    try {
        const client_check = await db.query(
            "SELECT 1 FROM public.client_data WHERE id = $1 AND user_id = $2",
            [client_id, user_id]
        );

        if (client_check.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Client didn't belong to this user"
            });
        }

        const project_check = await db.query(
            "SELECT 1 FROM public.project_data WHERE id = $1 AND user_id = $2 AND client_id = $3",
            [project_id, user_id, client_id]
        );

        if (project_check.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Project didn't belong to this user or does not match the selected client"
            });
        }

        const columns = ["user_id", "project_id", "client_id", "issue_date", "due_date", "total_amount", "notes"];
        const values = [user_id, project_id, client_id, issue_date, due_date, total_amount, notes];

         if (status?.toLowerCase() === "sent") {
            columns.push("status");
            values.push(status);

        }

        const placeholders = values.map((_, index) => `$${index + 1}`).join(" , ");
        const save_data = await db.query(
            `INSERT INTO public.invoice_data (${columns.join(" , ")}) VALUES (${placeholders}) RETURNING id`,
            values
        );

        const id = save_data.rows[0].id;

        // Save invoice number
        const current_year = new Date().getFullYear();
        const invoice_number = `INV-${current_year}-${id}`;

        await db.query("UPDATE public.invoice_data SET invoice_number = $1 WHERE id = $2 AND user_id = $3", [invoice_number, id , user_id]);

        // Save items in items_data
        for (const item of items || []) {
            await db.query(
                "INSERT INTO public.invoice_items (invoice_id , description , quantity , rate , amount , user_id) VALUES ($1 , $2 , $3 , $4 , $5 , $6)",
                [
                    id,
                    item.description,
                    item.quantity,
                    item.rate,
                    Number(item.quantity || 0) * Number(item.rate || 0),
                    user_id
                ]
            );
        }

        if(status?.toLowerCase() === "sent"){
            const email_detail = await get_detail_for_email(user_id , client_id , project_id);
            const pdf_buffer = await generate_invoice_pdf(id, user_id);

            await send_email_to_client(
                email_detail.username,
                email_detail.user_email,
                email_detail.client_email,
                invoice_number,
                email_detail.client_name,
                email_detail.project_name,
                total_amount,
                due_date,
                notes,
                pdf_buffer
            );
        }

         await db.query("INSERT INTO public.activity_log (user_id , activity_type , title , description) VALUES ($1 , $2 , $3 , $4)" , [user_id , "invoice_created" , "Invoice created" , invoice_number]);

        res.status(200).json({
            success : true,
            message : "Invoices saved successfully"
        });
        
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Failed to save invoice"
        })
    }
}


export async function get_invoice(req , res) {
    const user_id = req.user.user_id;

    try {
        const invoice_query = await db.query(
            `SELECT
                invoice.id,
                invoice.user_id,
                invoice.invoice_number,
                invoice.total_amount,
                invoice.notes,
                invoice.status,
                to_char(invoice.issue_date, 'DD-MM-YYYY') AS issue_date,
                to_char(invoice.due_date, 'DD-MM-YYYY') AS due_date,
                COALESCE(project.project_name, '-') AS project_name,
                COALESCE(client.client_name, '-') AS client_name
             FROM public.invoice_data AS invoice
             LEFT JOIN public.project_data AS project ON project.id = invoice.project_id
             LEFT JOIN public.client_data AS client ON client.id = invoice.client_id
             WHERE invoice.user_id = $1
             ORDER BY invoice.id DESC`,
            [user_id]
        );

        const invoice_data = invoice_query.rows;

        return res.status(200).json({
            invoice_data : invoice_data,
            success : true , 
            message : "Invoice data fetched successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error getting invoice data"
        })
    }
}


export async function get_items(req , res) {
    const user_id = req.user.user_id;
    const invoice_id = req.params.invoice_id;

    try {
        const items_query = await db.query("SELECT * FROM public.invoice_items WHERE invoice_id = $1 AND user_id = $2" , [invoice_id , user_id]);
        const items_data = items_query.rows;

        return res.status(200).json({
            items : items_data,
            success : true,
            message : "items data fetched successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error getting items from db"
        })
    }
}

export async function download_invoice_pdf(req , res) { 
    const user_id = req.user.user_id;
    const invoice_id = req.params.invoice_id;
   
    try {
        const invoice_query = await db.query(
            "SELECT invoice_number FROM public.invoice_data WHERE id = $1 AND user_id = $2",
            [invoice_id, user_id]
        );

        if (invoice_query.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        const pdf_buffer = await generate_invoice_pdf(invoice_id, user_id);
        const file_name = `invoice-${invoice_query.rows[0]?.invoice_number || invoice_id}.pdf`;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=${file_name}`);
        return res.send(pdf_buffer);
    } catch (error) {
        if (error.message === "Invoice not found") {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to generate invoice PDF"
        });
    }
}

export async function send_invoice(req , res) {
    const user_id = req.user.user_id;
    const { invoice_id } = req.body;

    if (!invoice_id) {
        return res.status(400).json({
            success: false,
            message: "invoice_id is required"
        });
    }

    try {
        const invoice_query = await db.query(
            `SELECT id, user_id, client_id, project_id, invoice_number, total_amount, notes, due_date, status
             FROM public.invoice_data
             WHERE id = $1 AND user_id = $2`,
            [invoice_id, user_id]
        );

        if (invoice_query.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        const invoice = invoice_query.rows[0];
        const pdf_buffer = await generate_invoice_pdf(invoice.id, user_id);
        const email_detail = await get_detail_for_email(invoice.user_id, invoice.client_id, invoice.project_id);

        await send_email_to_client(
            email_detail.username,
            email_detail.user_email,
            email_detail.client_email,
            invoice.invoice_number,
            email_detail.client_name,
            email_detail.project_name,
            invoice.total_amount,
            invoice.due_date,
            invoice.notes,
            pdf_buffer
        );

        await db.query(
            "UPDATE public.invoice_data SET status = $1 WHERE id = $2",
            ["Sent", invoice.id]
        );

        await db.query("INSERT INTO public.activity_log (user_id , activity_type , title , description) VALUES ($1 , $2 , $3 , $4)" , [user_id , "invoice_sent" , "Invoice sent to client" , `Invoice ${invoice.invoice_number} sent to client ${email_detail.client_name}`]);

        return res.status(200).json({
            success: true,
            message: "Invoice sent successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to send invoice"
        });
    }
}


export async function mark_sent(req , res) {
    const user_id = req.user.user_id;
    const invoice_id = req.body.invoice_id;

    try {
        await db.query(
            "UPDATE public.invoice_data SET status = $1 WHERE id = $2 AND user_id = $3",
            ["Sent", invoice_id, user_id]
        );
        return res.status(200).json({
            success : true,
            message : "Marked as sent successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Failed to update db and mark sent"
        });
    }
}

export async function mark_as_paid(req , res) {
    const user_id = req.user.user_id;
    const invoice_id = req.body.invoice_id;
    const current_date = new Date().toISOString().split('T')[0];

    try {
        const mark_paid_query = await db.query(
            "UPDATE public.invoice_data SET status = $1 , paid_at = $2 WHERE id = $3 AND user_id = $4 RETURNING invoice_number , client_id , project_id",
            ["Paid", current_date, invoice_id, user_id]
        );

        if (!mark_paid_query.rows || mark_paid_query.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        const invoice_number = mark_paid_query.rows[0].invoice_number;
        const client_id = mark_paid_query.rows[0].client_id;
        const project_id = mark_paid_query.rows[0].project_id;

        const client_name_query = await db.query("SELECT client_name FROM public.client_data WHERE id = $1 AND user_id = $2", [client_id, user_id]);
        const client_name = client_name_query.rows[0]?.client_name ?? '';

        const project_name_query = await db.query("SELECT project_name FROM public.project_data WHERE id = $1 AND user_id = $2", [project_id, user_id]);
        const project_name = project_name_query.rows[0]?.project_name ?? '';

        await db.query("INSERT INTO public.activity_log (user_id , activity_type , title , description) VALUES ($1 , $2 , $3 , $4)", [user_id, "invoice_paid", "Invoice paid", `Invoice ${invoice_number} paid by client ${client_name} for project ${project_name}`]);

        return res.status(200).json({
            success: true,
            message: "Status updated to Paid successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating the status of invoice data"
        });
    }
};

export async function cancel_invoice(req , res) {
    const user_id = req.user.user_id;
    const invoice_id = req.body.invoice_id;

    try {
        const cancel_invoice_query = await db.query("UPDATE public.invoice_data SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING invoice_number" , ["Cancelled" , invoice_id , user_id]);

        const invoice_number = cancel_invoice_query.rows[0].invoice_number;

        await db.query("INSERT INTO public.activity_log (user_id , activity_type , title , description) VALUES ($1 , $2 , $3 , $4)" , [user_id , "invoice_cancelled" , "Invoice cancelled" ,  `Invoice ${invoice_number} cancelled`]);
        return res.status(200).json({
            success: true,
            message: "Status updated to Cancelled successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error updating the status to cancelled"
        });
    }
}

export async function delete_invoice(req , res) {
    const user_id = req.user.user_id;
    const invoice_id = req.body.invoice_id;
    try {
        const delete_query = await db.query("DELETE FROM public.invoice_data WHERE id = $1 AND user_id = $2 RETURNING invoice_number", [invoice_id, user_id]);

        if (!delete_query.rows || delete_query.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Invoice not found or not authorized' });
        }

        const invoice_number = delete_query.rows[0].invoice_number;

        await db.query("INSERT INTO public.activity_log (user_id , activity_type , title , description) VALUES ($1 , $2 , $3 , $4)", [user_id, "invoice_deleted", "Invoice deleted", `Invoice ${invoice_number} deleted`]);

        res.status(200).json({
            success: true,
            message: "Invoice deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        return res.status(500).json({
            success: false,
            message: "Error deleting invoice"
        });
    }
}



async function get_detail_for_email(user_id , client_id , project_id) {
            // Get username and email

            const user_query = await db.query("SELECT username , email FROM public.users WHERE id = $1" , [user_id]);
            const {username , user_email} = user_query.rows[0];

            // client email

            const client_email_query = await db.query("SELECT client_name , email FROM public.client_data WHERE id = $1 AND user_id = $2" , [client_id , user_id]);

            const client_name = client_email_query.rows[0].client_name;
            const client_email = client_email_query.rows[0].email;

            // project name
            let project_name = "";
            if (project_id) {
                const project_name_query = await db.query("SELECT project_name FROM public.project_data WHERE id = $1 AND user_id = $2" , [project_id , user_id]);
                project_name = project_name_query.rows[0]?.project_name ?? "";
            }

            const details = {
                username : username,
                user_email : user_email,
                client_name : client_name,
                client_email : client_email,
                project_name : project_name
            }

            return details;
}

export async function get_amount_by_status(req , res) {
    const user_id = req.user.user_id;
    const {paid_ids , sent_ids , overdue_ids} =  req.body;
    try {
        const paid_amount_query = await db.query("SELECT amount FROM public.invoice_items WHERE invoice_id = ANY($1) AND user_id = $2", [paid_ids , user_id]);
        const sent_amount_query = await db.query("SELECT amount FROM public.invoice_items WHERE invoice_id = ANY($1) AND user_id = $2" , [sent_ids , user_id]);
        const overdue_amount_query = await db.query("SELECT amount FROM public.invoice_items WHERE invoice_id = ANY($1) AND user_id = $2" , [overdue_ids , user_id]);

        const paid_amount = paid_amount_query.rows;
        const sent_amount = sent_amount_query.rows;
        const overdue_amount = overdue_amount_query.rows;
        
        res.status(200).json({
            paid_amount : paid_amount,
            sent_amount : sent_amount,
            overdue_amount : overdue_amount,
            success : true,
            message : "Amount fetched successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message  : "Error fetching amount data"
        });
    }
}

export async function get_outstanding(req , res) {
    const user_id = req.user.user_id;
    try {
        const outstanding_query = await db.query("SELECT COALESCE(SUM(amount) , 0) AS total_outstanding FROM public.invoice_items it JOIN public.invoice_data da ON da.id = it.invoice_id WHERE da.user_id = $1 AND da.status = $2" , [user_id , "Sent"]);

        const outstanding_data = outstanding_query.rows[0];

        const total_outstanding = Number(outstanding_data.total_outstanding);
       

        res.status(200).json({
            total_outstanding : total_outstanding,
            success : true,
            message : "Successfully calculated outstanding"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error calculating outstanding"
        })
    }
}

export async function this_month_payment(req , res) {
    const user_id = req.user.user_id;

    try {
        const monthly_payment_query = await db.query(
            `SELECT COALESCE(SUM(total_amount), 0) AS amount
             FROM public.invoice_data
             WHERE user_id = $1
               AND status = $2
               AND paid_at >= date_trunc('month', NOW())
               AND paid_at < date_trunc('month', NOW()) + INTERVAL '1 month'`,
            [user_id, 'Paid']
        );

        const amount = Number(monthly_payment_query.rows[0]?.amount ?? 0);

        res.status(200).json({
            amount : amount,
            success : true,
            message : "This month revenue calculated successfully"
        })



    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error calculating this month revenue"
        })
    }
}

async function send_email_to_client(username , user_email, Client_email , invoice_number , client_name , project_name , total_amount , due_date , notes, pdf_buffer = null) {
    const note_text = notes ? `\n\nNote: ${notes}` : '';

    const attachments = pdf_buffer && Buffer.isBuffer(pdf_buffer)
        ? [{
            filename: `invoice-${invoice_number}.pdf`,
            content: Buffer.from(pdf_buffer),
            contentType: 'application/pdf'
        }]
        : [];

    const mail = {
        from : `"${username}" <${user_email}>`,
        to : Client_email,
        subject : `Invoice ${invoice_number} from ${username}`,
        text : `Hii ${client_name},
Please find attached invoice ${invoice_number} for ${project_name || "our recent work"}, totaling ${total_amount}.

Due Date: ${due_date}${note_text}

If you have any questions about this invoice, just reply to this email.

Thank you
${username}`,
        attachments
    };

    await transporter.sendMail(mail);
};

async function generate_invoice_pdf(invoice_id, user_id) {
    const invoice_query = await db.query(
        `SELECT
            invoice.id,
            invoice.invoice_number,
            invoice.total_amount,
            invoice.notes,
            invoice.status,
            invoice.issue_date,
            invoice.due_date,
            COALESCE(client.email, '-') AS client_email,
            COALESCE(project.project_name, '-') AS project_name,
            COALESCE(client.client_name, '-') AS client_name
         FROM public.invoice_data AS invoice
         LEFT JOIN public.project_data AS project ON project.id = invoice.project_id
         LEFT JOIN public.client_data AS client ON client.id = invoice.client_id
         WHERE invoice.id = $1 AND invoice.user_id = $2`,
        [invoice_id, user_id]
    );

    if (invoice_query.rows.length === 0) {
        throw new Error("Invoice not found");
    }

    const invoice = invoice_query.rows[0];
    const items_query = await db.query(
        "SELECT description, quantity, rate, amount FROM public.invoice_items WHERE invoice_id = $1 ORDER BY id ASC",
        [invoice_id]
    );
    const items = items_query.rows;

    const user_query = await db.query("SELECT email FROM public.users WHERE id = $1", [user_id]);
    const user_email = user_query.rows[0]?.email || "-";

    const profile_query = await db.query(
        `SELECT invoice_name, address, gst_number, signature_url
         FROM public.invoice_profile
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [user_id]
    );

    const profile = profile_query.rows[0] || {};
    const company_name = profile.invoice_name || "Your Business";
    const company_address = profile.address || "Address not set";
    const tax_id = profile.gst_number || "-";
    const signature_url = profile.signature_url || null;

    const payment_query = await db.query(
        `SELECT type, details, is_default
         FROM public.payment_methods
         WHERE user_id = $1
         ORDER BY is_default DESC, id ASC
         LIMIT 1`,
        [user_id]
    );
    const default_payment_method = payment_query.rows[0] || null;

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];

    return new Promise((resolve, reject) => {
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        const format_date = (value) => {
            if (!value) return "-";
            const date = value instanceof Date ? value : new Date(value);
            return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-GB");
        };

        const money = (value) => Number(value || 0).toFixed(2);
        const split_lines = (text) => String(text || "")
            .split(/\r?\n|,/) 
            .map((line) => line.trim())
            .filter(Boolean);

        async function get_image_buffer(url) {
            if (!url) return null;
            try {
                const response = await fetch(url);
                if (!response.ok) return null;
                const arr = await response.arrayBuffer();
                return Buffer.from(arr);
            } catch {
                return null;
            }
        }

        function get_payment_display_data(method) {
            if (!method) {
                return {
                    title: "Payment method",
                    lines: ["No payment method added"]
                };
            }

            let details = method.details;
            if (typeof details === "string") {
                try {
                    details = JSON.parse(details);
                } catch {
                    details = {};
                }
            }

            if (method.type === "bank") {
                const account_name = details?.accountname || "Account holder";
                const account_no = String(details?.accountnumber || "");
                const ifsc = details?.ifsccode || "-";
                const bank_name = details?.bankname || "Bank";
                return {
                    title: "Bank transfer",
                    lines: [
                        account_name,
                        `${bank_name}`,
                        `A/C: ${account_no || "-"}`,
                        `IFSC: ${ifsc}`
                    ]
                };
            }

            if (method.type === "upi") {
                return {
                    title: "UPI",
                    lines: [details?.upiid || "-"]
                };
            }

            if (method.type === "paypal") {
                return {
                    title: "PayPal",
                    lines: [details?.paypalemail || "-"]
                };
            }

            return {
                title: "Payment method",
                lines: ["Available"]
            };
        }

        (async () => {
            try {
                const signature_buffer = await get_image_buffer(signature_url);
                const payment_display = get_payment_display_data(default_payment_method);
                const page_width = doc.page.width;
                const left_x = 50;
                const right_x = 330;
                const content_width = page_width - 100;

                doc.font("Helvetica-Bold").fontSize(20).fillColor("#111827").text("BUSINESS INVOICE", left_x, 48);
                doc.roundedRect(right_x, 46, 215, 88, 6).lineWidth(1).strokeColor("#D1D5DB").stroke();
                doc.font("Helvetica-Bold").fontSize(10).fillColor("#374151").text("INVOICE NO.", right_x + 12, 60);
                doc.font("Helvetica").fontSize(10).fillColor("#111827").text(invoice.invoice_number || "-", right_x + 12, 74);
                doc.font("Helvetica-Bold").fontSize(10).fillColor("#374151").text("DATE", right_x + 120, 60);
                doc.font("Helvetica").fontSize(10).fillColor("#111827").text(format_date(invoice.issue_date), right_x + 120, 74);
                doc.font("Helvetica-Bold").fontSize(10).fillColor("#374151").text("DUE DATE", right_x + 12, 100);
                doc.font("Helvetica").fontSize(10).fillColor("#111827").text(format_date(invoice.due_date), right_x + 12, 114);

                doc.font("Helvetica-Bold").fontSize(16).fillColor("#111827").text(company_name, left_x, 154);
                doc.font("Helvetica").fontSize(10).fillColor("#374151");
                split_lines(company_address).forEach((line, idx) => {
                    doc.text(line, left_x, 176 + idx * 14);
                });
                doc.text(`Tax ID: ${tax_id}`, left_x, 232);
                doc.text(`Email: ${user_email}`, left_x, 246);

                doc.font("Helvetica-Bold").fontSize(10).fillColor("#374151").text("BILL TO", left_x, 292);
                doc.moveTo(left_x, 306).lineTo(290, 306).strokeColor("#D1D5DB").stroke();
                doc.font("Helvetica").fontSize(10).fillColor("#111827").text(invoice.client_name || "-", left_x, 314);
                doc.fillColor("#374151").text(invoice.client_email || "-", left_x, 328);
                doc.fillColor("#374151").text(invoice.project_name && invoice.project_name !== '-' ? `Project: ${invoice.project_name}` : "Project: -", left_x, 342);

                doc.font("Helvetica-Bold").fontSize(10).fillColor("#374151").text("PAYMENT OPTIONS", 320, 292);
                doc.moveTo(320, 306).lineTo(545, 306).strokeColor("#D1D5DB").stroke();
                doc.font("Helvetica").fontSize(10).fillColor("#111827").text(payment_display.title, 320, 314);
                payment_display.lines.slice(0, 4).forEach((line, index) => {
                    doc.fillColor("#374151").text(line, 320, 328 + index * 14);
                });

                let y = 382;
                doc.rect(left_x, y, content_width, 24).fillAndStroke("#F3F4F6", "#D1D5DB");
                doc.font("Helvetica-Bold").fontSize(10).fillColor("#111827");
                doc.text("DESCRIPTION", left_x + 8, y + 7, { width: 280 });
                doc.text("QTY", 345, y + 7, { width: 50, align: "center" });
                doc.text("UNIT PRICE", 395, y + 7, { width: 70, align: "center" });
                doc.text("TOTAL", 470, y + 7, { width: 70, align: "right" });

                y += 24;
                let subtotal = 0;

                (items.length ? items : [{ description: "-", quantity: 0, rate: 0, amount: 0 }]).forEach((item) => {
                    const row_h = 22;
                    doc.rect(left_x, y, content_width, row_h).strokeColor("#E5E7EB").stroke();
                    const amount = Number(item.amount ?? Number(item.quantity || 0) * Number(item.rate || 0));
                    subtotal += amount;

                    doc.font("Helvetica").fontSize(10).fillColor("#111827");
                    doc.text(item.description || "-", left_x + 8, y + 6, { width: 280, ellipsis: true });
                    doc.text(String(item.quantity ?? 0), 345, y + 6, { width: 50, align: "center" });
                    doc.text(money(item.rate), 395, y + 6, { width: 70, align: "center" });
                    doc.text(money(amount), 470, y + 6, { width: 70, align: "right" });

                    y += row_h;
                });

                const discount = 0;
                const tax_rate = 0;
                const tax_amount = 0;
                const shipping = 0;
                const grand_total = subtotal - discount + tax_amount + shipping;

                const total_x = 365;
                let total_y = y + 16;

                const total_row = (label, value, bold = false) => {
                    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(10).fillColor("#111827").text(label, total_x, total_y, { width: 110 });
                    doc.text(value, total_x + 120, total_y, { width: 60, align: "right" });
                    total_y += 16;
                };

                total_row("TOTAL", money(grand_total), true);

                doc.font("Helvetica").fontSize(10).fillColor("#374151").text("Remarks / Instructions:", left_x, y + 18);
                doc.text(invoice.notes || "-", left_x, y + 34, { width: 280, height: 54 });

                const signature_y = total_y + 8;
                if (signature_buffer) {
                    try {
                        doc.image(signature_buffer, 430, signature_y, { fit: [110, 50], align: "right" });
                    } catch {
                        doc.font("Helvetica").fontSize(9).fillColor("#9CA3AF").text("Signature unavailable", 430, signature_y + 16, { width: 110, align: "right" });
                    }
                }
                doc.font("Helvetica").fontSize(9).fillColor("#6B7280").text("Authorized Signature", 430, signature_y + 56, { width: 110, align: "right" });

                doc.moveTo(left_x, 770).lineTo(545, 770).strokeColor("#E5E7EB").stroke();
                doc.font("Helvetica").fontSize(10).fillColor("#111827").text("THANK YOU", left_x, 780);
                doc.fontSize(9).fillColor("#6B7280").text(`For questions about this invoice, contact: ${user_email}`, left_x, 794);

                doc.end();
            } catch (error) {
                reject(error);
            }
        })();
    });
}


