import db from "../db/connection.js";
import { OAuth2Client } from "google-auth-library";
import jwt from 'jsonwebtoken';
import { GOOGLE_CLIENT_ID, JWT_SECRET } from "../config.js";

const google_client = new OAuth2Client(GOOGLE_CLIENT_ID);

function setAuthCookie(res, token) {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
}
 

export async function google_login(req , res) {
    const credential = req.body.credential;
     if (!credential){
        return res.status(400).json({
            success : false,
            message : "Google token not received"
        })
     }

     try {
            const verify_token = await google_client.verifyIdToken({
            idToken : credential,
                audience : GOOGLE_CLIENT_ID
        })

        const payload = verify_token.getPayload();

        const google_id = payload.sub;
        const email = payload.email;
        const is_email_verified = payload.email_verified;
        const username = payload.name;
        const profile_url = payload.picture || null;

        if (!google_id && !email) {
            return res.status(400).json({
                success : false,
                message : "Didn't receive user details"
            })
        }

        // Check if this email already exist 

        const check_googleid_query = await db.query("SELECT id , email FROM public.users WHERE  google_id = $1"  , [google_id]);


        if (check_googleid_query.rows.length == 0){

            // Check if this email exist (user exist using manual signup)

            const email_exist_query = await db.query("SELECT id FROM public.users WHERE email = $1" , [email]) ;

            if (email_exist_query.rows.length == 0){

                // Store user in the db
                // New user from google auth

                if(is_email_verified){
                    const insert_data = await db.query("INSERT INTO public.users (username , email , is_verified , profile_pic_url , google_id) VALUES ($1 , $2 , $3 , $4 , $5) RETURNING id" , [username , email , true , profile_url , google_id ]);

                    const inserted_user_id = insert_data.rows[0].id;

                    // create jwt token for user

                    const jwt_payload = {
                        user_id : inserted_user_id
                    }

                    const jwt_token = await jwt.sign(jwt_payload , JWT_SECRET , {
                        expiresIn : '7d'
                    });

                    setAuthCookie(res, jwt_token);

                    res.status(200).json({
                    success : true,
                    message : "User saved and token created successfully"
                });
                }
                else{
                    return res.status(400).json({
                    success : false,
                    message : "User email is not verified"
                });
                }
                

            }

            else{

                if(is_email_verified){
                    const user_id =email_exist_query.rows[0].id;

                    await db.query("UPDATE public.users SET google_id = $1 , is_verified = $2 WHERE id = $3" , [google_id , true , user_id])

                    const jwt_payload = {
                        user_id : user_id
                    }
                    const jwt_token = await jwt.sign(jwt_payload , JWT_SECRET , {
                        expiresIn : '7d'
                    })

                    setAuthCookie(res, jwt_token);

                    res.status(200).json({
                    success : true,
                    message : "User saved and token created successfully"
                });
                }
                else{
                    return res.status(400).json({
                        success : false,
                        message : "User email is not verified"
                    })
                }
                }              
           

        }
        else{
            // Create jwt token for the user and send

            const user_id = check_googleid_query.rows[0].id;

            const jwt_payload = {
                user_id : user_id
            }
            
            const jwt_token = jwt.sign(jwt_payload , JWT_SECRET , {
                expiresIn : '7d'
            });

            setAuthCookie(res, jwt_token);

            res.status(200).json({
                success : true,
                message: "Token created for already existed user"
            })
        }
       


     } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error authenticating the user"
        })
     }

     
}