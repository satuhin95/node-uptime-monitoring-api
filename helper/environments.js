/*
* Title: Environments
* Description: Handle all Environment
* Author: Saifuddin
* Date:29/5/2022
*
*/
// module scaffolding

const environments = {};

environments.staging = {
    port:8080,
    envName:'staging',
    secretkey:'victoria',
    maxChecks:5,
    twilio:{
        fromPhone:'+18124722766',
        accountSID:"AC6a4f67cf012180750980cd3cb381b51f",
        authToken:'f49a37d4b5317954d943e2127c602e27'
    }
};

environments.production = {
    port:8000,
    envName:'production',
    secretkey:'victoria'
};
// determine which environments was passed
const currentEnvironment = typeof(process.env.NODE_ENV)==='string' ? process.env.NODE_ENV  : 'staging';


// export corresponding environment Object 
const environmentToExport = typeof(environments[currentEnvironment])==='object'? environments[currentEnvironment] : environments.staging;

// export module 
module.exports = environmentToExport;