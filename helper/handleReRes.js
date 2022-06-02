/*
* Title: Handle Request Response
* Description: Handle Request and response
* Author: Saifuddin
* Date:29/5/2022
*
*/
//dependencies
const {StringDecoder} = require('string_decoder');
const url = require('url');
const routes = require('../routes')
const {notFoundHandler}  =  require('../handlers//routeHandlers/notFoundHandler');
const {parseJSON} = require('../helper/utilities');
// moduel scaffolding

const handler ={};

handler.handleReRes  = (req, res)=>{
    // request handling 
    // get the url and parse it 
    const parseedUrl = url.parse(req.url,true);
    const path = parseedUrl.pathname;
    const trimmedpath = path.replace(/^\/+|\/+$/g,'');
    const method = req.method.toLowerCase();
    const queryString = parseedUrl.query;
    const requestHeader = req.headers;

    const requestProperties ={
        parseedUrl,
        path,
        trimmedpath,
        method,
        queryString,
        requestHeader
    };

    const decoder = new StringDecoder('utf-8');
    let realData ='';

    const chosenHandler = routes[trimmedpath]? routes[trimmedpath]: notFoundHandler;

    

    req.on('data',(buffer)=>{
        realData += decoder.write(buffer);
    });

    req.on('end',()=>{
        realData += decoder.end();

        requestProperties.body = parseJSON(realData);

        chosenHandler(requestProperties,(statusCode,payload)=>{
            statusCode = typeof(statusCode) === 'number' ? statusCode : 500;
            payload = typeof(payload) === 'object' ? payload : {} ;
    
            const payloadString = JSON.stringify(payload);
    
            // return the final response 
            res.setHeader('Content-type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        })
         // response handle 
    //  res.end("Hello World");
    })

};

module.exports = handler ;