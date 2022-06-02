/*
* Title: Server library
* Description: Server related files
* Author: Saifuddin
* Date:1/6/2022
*
*/

// dependencies s
const http = require('http');
const {handleReRes} = require('../helper/handleReRes');
const environment = require('../helper/environments');
// const data = require('./lib/data');

// const {sendTwilioSms} = require('./helper/notification')


//  server object 
const server ={};

// sms notification check 
// sendTwilioSms('01521231285','Hello node js',(err)=>{
//     console.log(`This is the error, ${err}`)
// })
// create server 
server.createServer = ()=>{
       const createServerVariable = http.createServer(server.handleReRes);
       createServerVariable.listen(environment.port,()=>{
           console.log(`Listening to port ${environment.port}`)
       });
}

// hendle Request Response 
server.handleReRes = handleReRes;

// start the server 
server.init =()=>{
    server.createServer();
};

// exports 
module.exports = server;



