import express from 'express';
import cors from 'cors';
import db from './db/connection.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import authmiddleware from './auth_middleware.js';
import cookieParser from 'cookie-parser';
import { json } from 'stream/consumers';
import { JWT_SECRET } from './config.js';
import client_router from './routes/client.routes.js';
import project_router from './routes/project.routes.js';
import invoice_router from './routes/invoice.routes.js';
import profile_router from './routes/profile.routes.js';
import dashboard_router from './routes/dashboard.routes.js';
import google_auth_router from './routes/auth.routes.js';

// Setup nodemailer

const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth:{
        user: process.env.APP_EMAIL,
        pass : process.env.APP_PASSWORD
    }
});

async function send_otp_email(email, otp) {
  const mailOptions = {
    from: `"ClientDesk" <${process.env.APP_EMAIL}>`,
    to: email,
    subject: "Verification OTP from ClientDesk",
    text: `Your OTP for email verification at ClientDesk is ${otp}. This OTP is valid for 5 minutes.`
  };

  await transporter.sendMail(mailOptions); 
}


function  generate_otp() {
    return crypto.randomInt(100000 , 1000000);
}

// bcrypt 
const saltRounds = 11;

const app = express()
const port = process.env.PORT || 3000

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


app.post("/api/register" , async (req , res )=>{
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    // validating user

    try {
        const validate = await db.query("SELECT id , is_verified FROM public.users WHERE email = $1" , [email]);
        
        const userExist = validate.rows.length;
        if(userExist == 0 ){
            // hash password

            try {
                const hash = await bcrypt.hash(password , saltRounds);

                        try {
                        // store user
                        const insert_user = await db.query("INSERT INTO public.users (username , email , password_hash) VALUES ($1 ,$2 , $3) RETURNING id" , [name , email , hash]);
                        // Get user_id
                        const user_id = insert_user.rows[0].id;


                        // Generate otp
                        const otp = generate_otp()

                        // Otp expiry

                        const Expiry_time = new Date(Date.now() + 1000 * 60 * 5);

                        

                        // Store otp
                        try {
                            const store_otp = await db.query("INSERT INTO public.user_otp (user_id , otp , expiry_at , resend_count , lock_until) VALUES ($1 , $2 , $3 , $4 , $5)" , [user_id , otp , Expiry_time , 0 , null]);
                        } catch (error) {
                            return res.status(500).json({
                                success:false,
                                message : "Error storing otp in db"
                            })
                        }

                        // Send Email
                        try {
                            await send_otp_email(email, otp);
                            return res.status(200).json({ success: true, message: "OTP sent successfully" });
                        } catch (error) {
                            return res.status(500).json({ success: false, message: "Error sending the mail" });
                        }

                        


                    } catch (error) {
                        return res.status(500).json({
                            success : false,
                            message : "Error inserting data in db"
                        })
                    }
            } catch (error) {
                return res.status(500).json({
                    success:false,
                    message:"Error hashing the password"
                })
            }
        }
        else{
            const isverified = validate.rows[0].is_verified;
                if (!isverified){
                    
                    try {
                        
                        // Get user_id
                        const get_user_id = await db.query("SELECT id FROM public.users WHERE email = $1" , [email]);
                        const user_id = get_user_id.rows[0].id;
                        // check if otp already exist
                        
                        
                        const otp_query = await db.query("SELECT expiry_at FROM public.user_otp WHERE user_id = $1" , [user_id]);
                        const otp_expiry_time = otp_query.rows[0].expiry_at;
                        const current_time = new Date(Date.now());

                        
                        

                        if (current_time > otp_expiry_time){
                                // hash new password
                                
                                
                                const new_hash = await bcrypt.hash(password , saltRounds);

                                // Update new details 
                                
                                
                                const update_user = await db.query("UPDATE public.users SET username = $1 , password_hash  = $2 WHERE email = $3", [name , new_hash , email]);
                                // Generate otp
                                const new_otp = generate_otp()

                                // Otp expiry
                                
                                
                                const new_expiry_time = new Date(Date.now() + 1000 * 60 * 5);

                                // Store otp
                                try {
                                    const delete_otp = await db.query("DELETE FROM public.user_otp WHERE user_id = $1", [user_id])
                                    const store_otp = await db.query("INSERT INTO public.user_otp (user_id , otp , expiry_at , resend_count , lock_until) VALUES ($1 , $2 , $3 , $4 , $5)" , [user_id , new_otp , new_expiry_time , 0 , null]);
                                } catch (error) {
                                    return res.status(500).json({
                                        success:false,
                                        message : "Error storing otp in db"
                                    })
                                }
                                
                                
                                // Send Email
                                
                                try {
                                        await send_otp_email(email, new_otp);
                                        return res.status(200).json({ success: true, message: "OTP sent successfully" });
                                    
                                } catch (error) {
                                    return res.status(500).json({ success: false, message: "Error sending the mail" });                                   
                                }
                                
                                
                                }
                                else{
                                    return res.status(200).json({
                                        success:true , message : "If the account exists, the OTP has been sent."
                                    })
                                }


                        
                    } catch (error) {
                        res.status(500).json({
                            success : false,
                            message : "Error verifying the user"
                        })
                    }
                }
                else{
                    res.status(200).json({
                        success : true , 
                        message : "If the account exists, the OTP has been sent."
                    })
                }
            
            
        }


    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error?.message || "Error validating the user"
        });
    }
  
});

app.post('/api/register/otp' , async (req , res)=>{
    
    try {
        const resend = req.body.resend;
        const email = req.body.email;
        const sent_otp = req.body.submitted_otp;
        // get user id
            const id_query = await db.query("SELECT id FROM public.users WHERE email = $1" , [email]);

            if(id_query.rows.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "If the account exists, the OTP has been sent."
                });
            }

            const user_id = id_query.rows[0].id;
        if(resend){
            const otp_attempts = await db.query("SELECT resend_count , lock_until FROM public.user_otp WHERE user_id = $1", [user_id]);

            if (otp_attempts.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid OTP or request expired."
                });
            }

            const current_time = new Date(Date.now());
            const existing_lock_until = otp_attempts.rows[0].lock_until ? new Date(otp_attempts.rows[0].lock_until) : null;
            const resend_count = Number(otp_attempts.rows[0].resend_count || 0);

            if (existing_lock_until && current_time < existing_lock_until) {
                const remaining_ms = Math.max(existing_lock_until.getTime() - current_time.getTime(), 0);
                const remaining_minutes = Math.ceil(remaining_ms / 60000);

                return res.status(429).json({
                    success: false,
                    message: `OTP resend is locked for ${remaining_minutes} minute(s). Please try again later.`,
                    locked_until: existing_lock_until.toISOString()
                });
            }

            if (existing_lock_until && current_time >= existing_lock_until) {
                await db.query("UPDATE public.user_otp SET resend_count = $1 , lock_until = $2 WHERE user_id = $3", [0, null, user_id]);
            }

            if (resend_count >= 5) {
                const new_lock_until = new Date(Date.now() + 15 * 60 * 1000);
                await db.query("UPDATE public.user_otp SET resend_count = $1 , lock_until = $2 WHERE user_id = $3", [5, new_lock_until, user_id]);
                return res.status(429).json({
                    success: false,
                    message: "OTP resend limit reached. Please try again in 15 minutes.",
                    locked_until: new_lock_until.toISOString()
                });
            }

            const new_otp = generate_otp();
            const new_expiry_time = new Date(Date.now() + 1000 * 60 * 5);
            const next_resend_count = resend_count + 1;
            const should_lock = next_resend_count >= 5;
            const new_lock_until = should_lock ? new Date(Date.now() + 15 * 60 * 1000) : null;

            try {
                await db.query("UPDATE public.user_otp SET otp = $1 , expiry_at = $2 , resend_count = $3 , lock_until = $4 WHERE user_id = $5", [new_otp, new_expiry_time, next_resend_count, new_lock_until, user_id]);
            } catch (error) {
                return res.status(500).json({
                    success:false,
                    message : "Error storing otp in db"
                })
            }

            try {
                    await send_otp_email(email, new_otp);
                    return res.status(200).json({
                        success: true,
                        message: should_lock ? "OTP sent successfully. Resend is locked for 15 minutes." : "OTP sent successfully",
                        locked_until: new_lock_until ? new_lock_until.toISOString() : null
                    });

            } catch (error) {
                return res.status(500).json({ success: false, message: "Error sending the mail" });
            }
        }
        else{
            try {
                // db otp
                const otp_query = await db.query("SELECT otp , expiry_at FROM public.user_otp WHERE user_id = $1" ,[user_id]);
                if (otp_query.rows.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid OTP or request expired."
                    });
                }

                    const db_otp = otp_query.rows[0].otp;
                    const current_time = new Date(Date.now());
                    const expiry_at = otp_query.rows[0].expiry_at;
                    const resend_count = Number(otp_query.rows[0].resend_count || 0);
                    const lock_until = otp_query.rows[0].lock_until ? new Date(otp_query.rows[0].lock_until) : null;

                    if (lock_until && current_time < lock_until) {
                        const remaining_ms = Math.max(lock_until.getTime() - current_time.getTime(), 0);
                        const remaining_minutes = Math.ceil(remaining_ms / 60000);

                        return res.status(429).json({
                            success: false,
                            message: `OTP verification is locked for ${remaining_minutes} minute(s). Please request a new one.`
                        });
                    }

                    if (expiry_at > current_time){
                        if (sent_otp == db_otp){
                            // user verify status
                            const verify_user = await db.query("UPDATE public.users SET is_verified = $1 WHERE id = $2" , [true , user_id]);
                            // delete otp
                            const delete_otp = await db.query("DELETE FROM public.user_otp WHERE user_id = $1", [user_id]);
                            // create jwt token
                            const payload = {user_id : user_id}
                            const jwt_token = jwt.sign(payload , JWT_SECRET , {
                                expiresIn : '7d'
                            });
                                res.cookie('token' , jwt_token , {
                                    httpOnly: true,
                                    secure: process.env.NODE_ENV === 'production',
                                    sameSite: 'lax',
                                    maxAge: 7 * 24 * 60 * 60 * 1000
                                });
                            res.status(200).json({ 
                                success : true,
                                message : "Otp verification successful"
                            });
                        }
                        else{
                            const failed_attempts = resend_count + 1;
                            const should_lock = failed_attempts >= 5;
                            const new_lock_until = should_lock ? new Date(Date.now() + 15 * 60 * 1000) : null;

                            await db.query(
                                "UPDATE public.user_otp SET resend_count = $1 , lock_until = $2 WHERE user_id = $3",
                                [failed_attempts, new_lock_until, user_id]
                            );

                            return res.status(400).json({
                                success:false,
                                message : "Invalid OTP or request expired."
                            });
                        }
                    }
                    else{
                        return res.status(400).json({
                            success:false,
                            message:"Invalid OTP or request expired."
                        });
                    }
            } catch (error) {
               res.status(500).json({
                success:false,
                message : `Internal Server Error `
               }) 
            }
            
        }
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: error?.message || "Internal Server error!" 
        });
    }
});

app.get("/api/verify_token", authmiddleware , async (req , res)=>{
    const id = req.user.user_id;
    try {
        const query = await db.query("SELECT username , email FROM public.users WHERE id = $1" , [id]);
        const response_length = query.rows.length;
        if(response_length == 0){
            return res.status(500).json({
                success : false,
                message : "Error in token verification at server"
            })
        }
        else{
            const username = query.rows[0].username;
            const email = query.rows[0].email;
            return res.status(200).json({
                success : true,
                username : username,
                email : email,
                id : req.user.user_id
    });

        }
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : error?.message || "Error in token verification"
        });
    }
    
})


app.post('/api/login' , async (req, res)=>{
    let email = req.body.email;
    let password = req.body.password;

    try {
        // check if user exist
        const userexist_query = await db.query("SELECT * FROM public.users WHERE email = $1" , [email]);
        const response_length = userexist_query.rows.length;
        if (response_length == 0){
            return res.status(400).json({
                success : false,
                message : "Invalid email or password"
            });
        }
        else{
            const user = userexist_query.rows[0];
            const is_verified = user.is_verified;
            if (is_verified == false){
                return res.status(400).json({
                    success : false,
                    message : "Invalid email or password"
                });

            }

            const now = new Date(Date.now());
            const locked_until = user.login_locked_until ? new Date(user.login_locked_until) : null;

            if (locked_until && now < locked_until) {
                const remaining_ms = Math.max(locked_until.getTime() - now.getTime(), 0);
                const remaining_minutes = Math.ceil(remaining_ms / 60000);

                return res.status(429).json({
                    success: false,
                    message: `Too many failed login attempts. Please try again in ${remaining_minutes} minute(s).`
                });
            }

            if (locked_until && now >= locked_until) {
                await db.query("UPDATE public.users SET failed_login_attempts = $1, login_locked_until = $2 WHERE id = $3", [0, null, user.id]);
            }

            const username = user.username;
            const db_hash_password = user.password_hash;
            const id = user.id;
            // check password
            const check_password = await bcrypt.compare(password , db_hash_password);

            if(check_password == false){
                const failed_attempts = Number(user.failed_login_attempts || 0) + 1;

                if (failed_attempts >= 5) {
                    const new_lock_until = new Date(Date.now() + 15 * 60 * 1000);
                    await db.query("UPDATE public.users SET failed_login_attempts = $1, login_locked_until = $2 WHERE id = $3", [5, new_lock_until, id]);
                    return res.status(429).json({
                        success: false,
                        message: "Too many failed attempts. Your account is locked for 15 minutes."
                    });
                }

                await db.query("UPDATE public.users SET failed_login_attempts = $1, login_locked_until = $2 WHERE id = $3", [failed_attempts, null, id]);

                return res.status(400).json({
                    success : false,
                    message : "Invalid email or password"
                });
            }
            else{
                await db.query("UPDATE public.users SET failed_login_attempts = $1, login_locked_until = $2 WHERE id = $3", [0, null, id]);
                // create jwt token
                const payload = {user_id : id}
                const token = jwt.sign(payload , JWT_SECRET , {expiresIn : '7d'})

                res.cookie('token' , token , {
                    httpOnly : true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite : 'lax',
                    maxAge : 7 * 24 * 60 * 60 * 1000
                })

                return res.status(200).json({
                    success : true,
                    message : "Login successful"
                });
            }
        }
    } catch (error) {
        return res.status(500).json({
            success : false , 
            message : error.message
        });
    }
})

app.post('/api/forgot-password', async (req, res) => {
    try {
        const email = req.body.email;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required.'
            });
        }

        const user_query = await db.query("SELECT id, email, password_reset_attempts, password_reset_locked_until FROM public.users WHERE email = $1", [email]);

        if (user_query.rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'If the account exists, a password reset OTP has been sent.'
            });
        }

        const user = user_query.rows[0];
        const now = new Date(Date.now());
        const reset_lock_until = user.password_reset_locked_until ? new Date(user.password_reset_locked_until) : null;

        if (reset_lock_until && now < reset_lock_until) {
            return res.status(200).json({
                success: true,
                message: 'If the account exists, a password reset OTP has been sent.'
            });
        }

        if (reset_lock_until && now >= reset_lock_until) {
            await db.query("UPDATE public.users SET password_reset_attempts = $1, password_reset_locked_until = $2 WHERE id = $3", [0, null, user.id]);
        }

        const current_attempts = Number(user.password_reset_attempts || 0);
        if (current_attempts >= 5) {
            const lock_until = new Date(Date.now() + 15 * 60 * 1000);
            await db.query("UPDATE public.users SET password_reset_attempts = $1, password_reset_locked_until = $2 WHERE id = $3", [5, lock_until, user.id]);
            return res.status(200).json({
                success: true,
                message: 'If the account exists, a password reset OTP has been sent.'
            });
        }

        const reset_otp = generate_otp();
        const reset_expiry = new Date(Date.now() + 1000 * 60 * 5);

        try {
            const existing_reset_otp = await db.query("SELECT id FROM public.user_otp WHERE user_id = $1", [user.id]);

            if (existing_reset_otp.rows.length > 0) {
                await db.query(
                    "UPDATE public.user_otp SET otp = $1, expiry_at = $2, resend_count = $3, lock_until = $4 WHERE user_id = $5",
                    [reset_otp, reset_expiry, 0, null, user.id]
                );
            } else {
                await db.query(
                    "INSERT INTO public.user_otp (user_id, otp, expiry_at, resend_count, lock_until) VALUES ($1, $2, $3, $4, $5)",
                    [user.id, reset_otp, reset_expiry, 0, null]
                );
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error storing reset OTP.'
            });
        }

        try {
            await send_otp_email(email, reset_otp);
            await db.query("UPDATE public.users SET password_reset_attempts = $1 WHERE id = $2", [current_attempts + 1, user.id]);

            return res.status(200).json({
                success: true,
                message: 'Password reset OTP sent to your email.'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error sending the reset OTP.'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/api/reset-password', async (req, res) => {
    try {
        const email = req.body.email;
        const new_password = req.body.new_password;
        const submitted_otp = req.body.submitted_otp;

        if (!email || !new_password || !submitted_otp) {
            return res.status(400).json({
                success: false,
                message: 'Email, new password, and OTP are required.'
            });
        }

        const user_query = await db.query("SELECT id, password_reset_attempts, password_reset_locked_until FROM public.users WHERE email = $1", [email]);

        if (user_query.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset request.'
            });
        }

        const user = user_query.rows[0];
        const now = new Date(Date.now());
        const reset_lock_until = user.password_reset_locked_until ? new Date(user.password_reset_locked_until) : null;

        if (reset_lock_until && now < reset_lock_until) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset request.'
            });
        }

        if (reset_lock_until && now >= reset_lock_until) {
            await db.query("UPDATE public.users SET password_reset_attempts = $1, password_reset_locked_until = $2 WHERE id = $3", [0, null, user.id]);
        }

        const otp_query = await db.query("SELECT otp, expiry_at FROM public.user_otp WHERE user_id = $1", [user.id]);

        if (otp_query.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset request.'
            });
        }

        const db_otp = otp_query.rows[0].otp;
        const expiry_at = new Date(otp_query.rows[0].expiry_at);

        if (expiry_at <= now) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset request.'
            });
        }

        if (String(submitted_otp) !== String(db_otp)) {
            const failed_attempts = Number(user.password_reset_attempts || 0) + 1;

            if (failed_attempts >= 5) {
                const lock_until = new Date(Date.now() + 15 * 60 * 1000);
                await db.query("UPDATE public.users SET password_reset_attempts = $1, password_reset_locked_until = $2 WHERE id = $3", [5, lock_until, user.id]);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid reset request.'
                });
            }

            await db.query("UPDATE public.users SET password_reset_attempts = $1 WHERE id = $2", [failed_attempts, user.id]);
            return res.status(400).json({
                success: false,
                message: 'Invalid reset request.'
            });
        }

        const hash = await bcrypt.hash(new_password, saltRounds);
        await db.query("UPDATE public.users SET password_hash = $1, password_reset_attempts = $2, password_reset_locked_until = $3 WHERE id = $4", [hash, 0, null, user.id]);
        await db.query("DELETE FROM public.user_otp WHERE user_id = $1", [user.id]);

        return res.status(200).json({
            success: true,
            message: 'Password reset successful.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

        app.post('/api/logout', (req, res) => {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });

            return res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        })

// Google auth
app.use("/api" , google_auth_router)



// Client page
app.use("/client" , client_router)

// Project page
app.use("/project" , project_router)

// invoice page
app.use("/invoice" , invoice_router)

// Profile page
app.use("/profile" , profile_router)

// Dashboard
app.use("/dashboard" , dashboard_router);

app.use((err, req, res, next) => {
    console.error(err);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: 'File is too large. Maximum size is 2 MB.'
        });
    }
    
    if (err.message === 'Only JPEG, PNG, and WebP images are allowed.') {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    return res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))