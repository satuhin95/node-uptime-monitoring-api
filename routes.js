/*
* Title: Route
* Description: Application Route
* Author: Saifuddin
* Date:29/5/2022
*
*/
// dependencies
const {sampleHandler} = require('./handlers/routeHandlers/simpleHandler');
const {userHandler} = require('./handlers/routeHandlers/userHandler');
const {tokenHandler} = require('./handlers/routeHandlers/tokenHandler');
const {checkHandler} = require('./handlers/routeHandlers/checkHandler');
const routes ={
    sample: sampleHandler,
    user: userHandler,
    token:tokenHandler,
    check:checkHandler
}

module.exports = routes;