/*
* Title: Project initial File
* Description: Initial file to start the node server and worker
* Author: Saifuddin
* Date:1/6/2022
*
*/

// dependencies 
const server = require('./lib/server')
const worker = require('./lib/worker')


//  app object 
const app ={};


app.init = ()=>{
 //start the server
    server.init();

    worker.init();
 //start the worker
};

app.init();

//export the app
module.exports = app;

