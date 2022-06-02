/*
* Title: Notification library
* Description: Important function to notify user
* Author: Saifuddin
* Date:31/5/2022
*
*/

// dependencies 

const https = require('https');
const querystring = require('node:querystring');
const {twilio} = require('./environments');
//module scaffolding
const notifications ={};

//send sms to user using twillio api 
notifications.sendTwilioSms = (phone, msg, callback)=>{
    const userPhone = typeof(phone)=== 'string' && phone.trim().length ===11 ? phone.trim() : false;
    const userMsg = typeof(msg)==='string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
    if(userPhone && userMsg){
        // configure the request payload
        const payload={
            From:'+18124722766',
            To:`+88 ${userPhone} `,
            Body:userMsg
        };

        //stringify the payload
        const stringifyPayload = querystring.stringify(payload);

        // configure the request details 
        const requestDetails ={
            hostname:'api.twilio.com',
            method:"POST",
            path:`/2010-04-01/Accounts/AC6a4f67cf012180750980cd3cb381b51f/Messages.json`,
            auth:`AC6a4f67cf012180750980cd3cb381b51f:f49a37d4b5317954d943e2127c602e27`,
            headers: {
                'Content-Type': 'application/json',
              },
        };
        // instantiate the request object
        const req = https.request(requestDetails,(res)=>{
            // get the statusof the send request
            const status = res.statusCode;
            //callback successfully if the request went through
            if(status===200 || status===201){
                callback(false);
            }else{
                callback(`Status code returned was ${status}`);
            }
        })
        req.on('error',(err)=>{
            callback(err);
        });
        req.write(stringifyPayload);
        req.end();

    }else{
        callback('Given parameters were missing or invalid!');
    }
};

//export the module
module.exports = notifications;
