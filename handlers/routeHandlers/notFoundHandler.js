/*
* Title: NotFound Handler
* Description: NotFound Handler
* Author: Saifuddin
* Date:29/5/2022
*
*/

// moduel scaffolding

const handler ={};

handler.notFoundHandler=(requestProperties, callback)=>{
    callback(404, {
        message:'Your request URL was not found!',
    });
};

module.exports = handler;