import db from "../db/connection.js";
import cloudinary from "../Cloudinary.js";
import bcrypt from 'bcrypt';

export async function save_payment_meathod(req , res) {
    const user_id = req.user.user_id;
    const type = req.body.type;
    const details = req.body.details;

    try {
        // save payment details

        const if_any_meathod_already_exist = await db.query("SELECT id FROM public.payment_methods WHERE user_id = $1" , [user_id]);

        if(if_any_meathod_already_exist.rows.length == 0){
            const save_payment_meathod = await db.query("INSERT INTO public.payment_methods (user_id , type , details , is_default) VALUES ($1 , $2 , $3 , $4)" , [user_id , type , details , true]);
        }
        else{
            const save_payment_meathod = await db.query("INSERT INTO public.payment_methods (user_id , type , details) VALUES ($1 , $2 , $3)" , [user_id , type , details]);
        } 
        
        

        res.status(200).json({
            success : true,
            message : "Payment meathod saved successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error saving payment meathod"
        });
    }

}

export async function get_payment_meathods(req , res) {
    const user_id = req.user.user_id;
    try {
        const get_meathod_query  = await db.query("SELECT *  FROM public.payment_methods WHERE user_id = $1" , [user_id]);

        const if_any_default = get_meathod_query.rows.some(user => user.is_default == true);

        if (get_meathod_query.rows.length > 0 && !if_any_default){
            const first_meathod_id = get_meathod_query.rows[0].id;
            const make_default = await db.query("UPDATE public.payment_methods SET is_default = $1 WHERE id = $2 AND user_id = $3" , [true , first_meathod_id  ,user_id]);
        }


        const meathods = get_meathod_query.rows;
        res.status(200).json({
            meathods : meathods,
            success : true,
            message : "Payment meathods fetched successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Failed to fetched payment meathods"
        })
    }
}


export async function delete_payment_meathod(req , res) {
    const user_id = req.user.user_id;
    const meathod_id = req.body.id;

    try {
        const delete_query = await db.query("DELETE FROM public.payment_methods WHERE id = $1 AND user_id = $2", [meathod_id , user_id]);

        res.status(200).json({
            success : true,
            message : "Payment meathod deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error deleting payment meathod"
        })
    }
}

export async function set_meathod_as_default(req , res) {
    const user_id = req.user.user_id;
    const id = req.body.id;   

    try {

        // remove if any existing default

        const remove_default = await db.query("UPDATE public.payment_methods SET is_default = $1 WHERE is_default = $2 AND user_id = $3",  [false , true , user_id]);

        // Set choosed meathod as default

        const set_default = await db.query("UPDATE public.payment_methods SET is_default = $1 WHERE id = $2 AND user_id = $3" , [true , id , user_id]);

        res.status(200).json({
            success : true,
            message : "Successfully updated default payment meathod"
        })

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error updating up default payment meathod"
        })
    }
}

export async function save_data(req , res) {
    const user_id = req.user.user_id;
    const invoice_name = req.body.invoice_name;
    const address = req.body.address;
    const taxid = req.body.taxid;



    try {
        const trimmed_invoice_name = invoice_name?.trim();
        const trimmed_address = address?.trim();

        if(!trimmed_invoice_name || !trimmed_address){
            return res.status(400).json({
                success : false,
                message : "Name on invoice and address are required"
            });
        }

        const existing_profile = await db.query(
            "SELECT id , signature_url FROM public.invoice_profile WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
            [user_id]
        );

        let signature_url = existing_profile.rows[0]?.signature_url || null;

        if (req.file) {
            const filebase64 = req.file.buffer.toString('base64');
            const fileuri = `data:${req.file.mimetype};base64,${filebase64}`;

            const upload_cloudinary = await cloudinary.uploader.upload(fileuri , {
                folder: "signatures",
                public_id: `signature_${req.user.user_id}`,
                overwrite: true,
                resource_type: "image"
            });

            signature_url = upload_cloudinary.secure_url;
        } else if (!signature_url) {
            return res.status(400).json({success : false , message : "No file uploaded"});
        }

        if (existing_profile.rows.length > 0) {
            await db.query(
                "UPDATE public.invoice_profile SET invoice_name = $1 , address = $2 , gst_number = $3 , signature_url = $4 WHERE id = $5",
                [trimmed_invoice_name , trimmed_address , taxid , signature_url , existing_profile.rows[0].id]
            );
        } else {
            await db.query(
                "INSERT INTO public.invoice_profile (user_id , invoice_name , address , gst_number , signature_url) VALUES ($1 , $2 , $3 , $4 , $5)",
                [user_id , trimmed_invoice_name , trimmed_address , taxid , signature_url]
            );
        }

        res.status(200).json({
            success : true,
            message : "Invoice profile made successfully"
        })
    } catch (error) {
        console.log("Error in save_data:", error?.message || error);
        return res.status(500).json({
            success: false,
            message: "Error uploading signature",
            error: error?.message || "Unknown error"
        });
    }
}

export async function get_user_invoicing(req , res) {
    const user_id = req.user.user_id;
    try {
        const invoicing_query = await db.query("SELECT invoice_name , address , gst_number , signature_url , created_at FROM public.invoice_profile WHERE user_id = $1" , [user_id]);

        const invoicing_data = invoicing_query.rows[0];

        res.status(200).json({
            invoicing_data : invoicing_data,
            success : true,
            message : "User invoicing details fetched successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Failed to get user invoicing details"
        })
    }
}


// Profile section

export async function get_profile_pic(req , res) {
    const user_id = req.user.user_id;

    try {
        const profile_query = await db.query("SELECT profile_pic_url FROM public.users WHERE id = $1" , [user_id]);
        const profile_url = profile_query.rows[0].profile_pic_url;
        if(!profile_url){
            return res.status(200).json({
                success : true,
                message : "No user profile pic exist",
                profile_url : null
            });
        }
        return res.status(200).json({
            success : true,
            message : "Profile url fetched successfully",
            profile_url : profile_url
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error getting user profile pic data"
        });
    }
}

export async function get_user_details(req , res) {
    const user_id = req.user.user_id;
    try {
        const user_query = await db.query("SELECT username , email FROM public.users WHERE id = $1" , [user_id]);
        const user_data = user_query.rows[0]
        res.status(200).json({
            user_data : user_data,
            success : true,
            message : "Fetched user data successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error to fetch user data"
        });
    }
}

export async function save_changes(req  ,res) {
    const user_id = req.user.user_id;
    const user_name = req.body.user_name;
    const current_password = req.body.currentpassword;
    const new_password = req.body.newpassword;
    const confirm_password = req.body.confirmpassword;

    const has_profile_pic = Boolean(req.file);
    const has_new_password = Boolean(current_password || new_password || confirm_password);

    if(user_name && !has_profile_pic && !has_new_password){
        try {
            const update_name_query  = await db.query("UPDATE public.users SET username = $1 WHERE id = $2" , [user_name , user_id]);
            return res.status(200).json({
                success : true,
                message : "User name saved successfully"
            })
        } catch (error) {
            return res.status(500).json({
                success : false,
                message : "Error upadating username"
            })
        }
    }
    try {
        let profile_pic_url = null;

        if (has_profile_pic) {
            const filebase64 = req.file.buffer.toString('base64');
            const fileuri = `data:${req.file.mimetype};base64,${filebase64}`;

            const upload_cloudinary = await cloudinary.uploader.upload(fileuri , {
                folder: "profile_pic",
                public_id: `profile_pic_${req.user.user_id}`,
                overwrite: true,
                resource_type: "image"
            });

            profile_pic_url = upload_cloudinary.secure_url;
        }

        let stored_password_hash = null;
        let hash_new_password = null;

        if (has_new_password) {
            if (!current_password || !new_password || !confirm_password) {
                return res.status(400).json({
                    success : false,
                    message : "Current password, new password and confirm password are required"
                });
            }

            if (new_password !== confirm_password) {
                return res.status(400).json({
                    success : false,
                    message : "New password and confirm password do not match"
                });
            }

            const stored_password_query = await db.query("SELECT password_hash FROM public.users WHERE id = $1" , [user_id]);
            stored_password_hash = stored_password_query.rows[0]?.password_hash;

            if (!stored_password_hash) {
                return res.status(404).json({
                    success : false,
                    message : "User password not found"
                });
            }

            const check_password = await bcrypt.compare(current_password , stored_password_hash);

            if(!check_password){
                return res.status(400).json({
                    success : false,
                    message : "Password didn't match",
                    match : false
                });
            }

            const saltRounds = 11;
            hash_new_password = await bcrypt.hash(new_password , saltRounds);
        }

        const fields_to_update = [];
        const values = [];

        if (user_name) {
            values.push(user_name);
            fields_to_update.push(`username = $${values.length}`);
        }

        if (profile_pic_url) {
            values.push(profile_pic_url);
            fields_to_update.push(`profile_pic_url = $${values.length}`);
        }

        if (hash_new_password) {
            values.push(hash_new_password);
            fields_to_update.push(`password_hash = $${values.length}`);
        }

        if (!fields_to_update.length) {
            return res.status(400).json({
                success : false,
                message : "No profile changes provided"
            });
        }

        values.push(user_id);
        await db.query(`UPDATE public.users SET ${fields_to_update.join(', ')} WHERE id = $${values.length}` , values);

        return res.status(200).json({
            success : true,
            message : "Profile updated successfully"
        });
    } catch (error) {
        console.log("Error updating user profile", error?.message || error);
        return res.status(500).json({
            success : false,
            message : "Error updating user profile"
        });
    }
}