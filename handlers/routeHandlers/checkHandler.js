/*
* Title: check Handler
* Description: handle to user defined checks
* Author: Saifuddin
* Date:30/5/2022
*
*/

//dependencies
const data = require('../../lib/data');
const {hash, parseJSON,createRandomString} = require('../../helper/utilities')
const tokenHandler = require('./tokenHandler')
// moduel scaffolding

const handler ={};

handler.checkHandler=( requestProperties, callback)=>{
const acceptedMethods =['get','post','put','delete'];
    if(acceptedMethods.indexOf(requestProperties.method)> -1){
        handler._check[requestProperties.method](requestProperties, callback);
    }else{
        callback(405);
    }
};
handler._check = {};

handler._check.post = (requestProperties, callback)=>{
    //validate inputes
    let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http','https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    let url = typeof(requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    let method = typeof(requestProperties.body.method) === 'string' && ['GET','POST','PUT','DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    let successCodes = typeof(requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;

    let timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <=5 ? requestProperties.body.timeoutSeconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds){
        //  token
        const token = typeof(requestProperties.requestHeader.token) === 'string'  ? requestProperties.requestHeader.token : false;

        // lookup the user phone by token 
        data.read('tokens',token,(err,result)=>{
            if(!err && result){
                let userPhone = parseJSON(result).phone;
                // lookup the user data 
                data.read('users',userPhone, (err, result)=>{
                    if(!err && result){
                        // token verify 
                        tokenHandler._token.verify(token, userPhone, (validToken)=>{
                            if(validToken){
                                let userObj = parseJSON(result);
                                let userChecks = typeof(userObj.checks)==='object' && userObj.checks instanceof Array? userObj.checks : [];

                                if(userChecks.length < 5){
                                    const checkId = createRandomString(20);
                                    const checkObject={
                                        id:checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds
                                    };

                                    // store the object 
                                    data.create('checks',checkId,checkObject,(err3)=>{
                                        if(!err3){
                                            // add check id to the user object 
                                            userObj.checks = userChecks;
                                            userObj.checks.push(checkId);

                                            //save the new user data

                                            data.update('users',userPhone,userObj,(err4)=>{
                                                if(!err4){
                                                    callback(200,checkObject);
                                                }else{
                                                    callback(500,{error:"There was a proble in server side!!"}) 
                                                }
                                            })

                                        }else{
                                            callback(500,{error:"There was a proble in server side!!"}) 
                                        }
                                    })


                                }else{
                                    callback(401,{error:"User has already reached max check limit!!"}) 
                                }

                            }else{
                                callback(403,{error:"Authentication problem!!"})
                            }
                        })
                    }else{
                        callback(403,{error:"User data not found!!"})
                    }
                })
            }else{
                callback(403,{error:"Authentication problem!!"})
            }
        })

    }else{
        callback(400,{error:"You have a problem in your request!!"})
    }

};
handler._check.get = (requestProperties, callback)=>{
//check the id
const id = typeof(requestProperties.queryString.id) === 'string' && requestProperties.queryString.id.trim().length === 20 ? requestProperties.queryString.id : false;
if(id){
    // lookup the check 
    data.read('checks',id,(err,result)=>{
        if(!err && result){

         //  token
        const token = typeof(requestProperties.requestHeader.token) === 'string'  ? requestProperties.requestHeader.token : false;
        tokenHandler._token.verify(token, parseJSON(result).userPhone, (validToken)=>{
            if(validToken){
                callback(200, parseJSON(result));
            }else{
                callback(404,{error:"Authentication failure!!"})
            }
        
        })
        }else{
            callback(500,{error:"There was a problem in server side!!"})
        }
    })
   
}else{
    callback(404,{error:"You have a problem in your request!!"})
}
};
handler._check.put = (requestProperties, callback)=>{
    //validate inputes
    const id = typeof(requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;

    let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http','https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    let url = typeof(requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    let method = typeof(requestProperties.body.method) === 'string' && ['GET','POST','PUT','DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    let successCodes = typeof(requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;

    let timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <=5 ? requestProperties.body.timeoutSeconds : false;

    if(id){
        if(protocol || url || method || successCodes || timeoutSeconds){
            // lookup check data 
            data.read('checks',id,(error6, result)=>{
                // callback(200,{data:parseJSON(result)})
                if(!error6 && result){
                    const checkObject = parseJSON(result);
                    const token = typeof(requestProperties.requestHeader.token) === 'string'  ? requestProperties.requestHeader.token : false;
                      // token verify 
                      tokenHandler._token.verify(token, checkObject.userPhone, (validToken)=>{
                        if(validToken){
                            if(protocol){
                                checkObject.protocol = protocol;
                            }
                            if(url){
                                checkObject.url = url;
                            }
                            if(method){
                                checkObject.method = method;
                            }
                            if(successCodes){
                                checkObject.successCodes = successCodes;
                            }
                            if(timeoutSeconds){
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }
                            // update checked data 
                            data.update('checks',id,checkObject,(err)=>{
                                if(!err){
                                    callback(200);
                                }else{
                                    callback(500,{error:"There was a problem in server side!"}) 
                                }
                            })
                        }else{
                            callback(400,{error:"Authentication failure!!"})
                        }
                      })
                }else{
                    callback(500,{error:"There was a problem in server side!"}) 
                }
            })
        }else{
            callback(400,{error:"You must provide at least one field to update!"})
        }

    }else{
        callback(400,{error:"You have a problem in your request"})
    }

};
handler._check.delete = (requestProperties, callback)=>{
//check the id
const id = typeof(requestProperties.queryString.id) === 'string' && requestProperties.queryString.id.trim().length === 20 ? requestProperties.queryString.id : false;
if(id){
    // lookup the check 
    data.read('checks',id,(err,result)=>{
        if(!err && result){

         //  token
        const token = typeof(requestProperties.requestHeader.token) === 'string'  ? requestProperties.requestHeader.token : false;
        tokenHandler._token.verify(token, parseJSON(result).userPhone, (validToken)=>{
            if(validToken){
                // delete the check data 
                data.delete('checks',id,(err)=>{
                    if(!err){
                        // lookup user data 
                        data.read('users',parseJSON(result).userPhone,(err,resultData)=>{
                            const userObject = parseJSON(resultData)
                            if(!err && resultData){
                                let userChecks = typeof(userObject.checks)==='object' && userObject.checks instanceof Array ? userObject.checks: [];
                                // remove the checkId from users 
                                let checkPosition = userChecks.indexOf(id);
                                if(checkPosition > -1){
                                    userChecks.splice(checkPosition,1);
                                    // resolve the user data 
                                    userObject.checks = userChecks;
                                    data.update('users',userObject.phone, userObject,(err)=>{
                                        if(!err){
                                            callback(200);
                                        }else{
                                            callback(500,{error:"There was a problem in server side!!"})
                                        }
                                    })
                                }else{
                                    callback(500,{error:"The chech id not found!!"})
                                }
                            }else{
                                callback(500,{error:"There was a problem in server side!!"})
                            }
                        })
                    }else{
                        callback(500,{error:"There was a problem in server side!!"})
                    }
                })
            }else{
                callback(404,{error:"Authentication failure!!"})
            }
        
        })
        }else{
            callback(500,{error:"There was a problem in server side!!"})
        }
    })
   
}else{
    callback(404,{error:"You have a problem in your request!!"})
}
};

module.exports = handler;