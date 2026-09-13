import crypto from 'crypto';

async function  generate_otp(params) {
    return crypto.randomInt(100000 , 1000000);
}