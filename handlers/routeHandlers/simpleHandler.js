/*
* Title: Sample Handler
* Description: Sample Handler
* Author: Saifuddin
* Date:29/5/2022
*
*/

// moduel scaffolding

const handler ={};

handler.sampleHandler=( requestProperties, callback)=>{
    console.log(requestProperties);
    callback(200, {
        message:'This is a sample url',
    });
};

module.exports = handler;