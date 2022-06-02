/*
* Title: user Handler
* Description: user Handler to handle user related routes
* Author: Saifuddin
* Date:30/5/2022
*
*/

//dependencies
    const data = require('../../lib/data');
    const {hash, parseJSON} = require('../../helper/utilities')
    const tokenHandler = require('./tokenHandler')
// moduel scaffolding

const handler ={};

handler.userHandler=( requestProperties, callback)=>{
    const acceptedMethods =['get','post','put','delete'];
        if(acceptedMethods.indexOf(requestProperties.method)> -1){
            handler._users[requestProperties.method](requestProperties, callback);
        }else{
            callback(405);
        }
};
handler._users = {};

handler._users.post = (requestProperties, callback)=>{
    
    const firstName = typeof(requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof(requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phone = typeof(requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    const tosAgreement = typeof(requestProperties.body.tosAgreement) === 'boolean' && requestProperties.body.tosAgreement ? requestProperties.body.tosAgreement : false;
    // callback(200,{message:tosAgreement})
    if(firstName && lastName && phone && password && tosAgreement){
        // make sure that the user dosen't exists
        data.read('users',phone, (err)=>{
            if(err){
                let userObj ={
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement
                };
                // store the user to db
                data.create('users', phone, userObj, (err1)=>{
                    if(!err1){
                        callback(200,{message:'User Created Successfully'})
                    }else{
                        callback(500,{error:'Could not create user!!'})
                    }
                })
            }else{
                callback(500, { error:'There was a problem in server side!' });
            }
        });

    }else{
        
        callback(400,{error:`You have a problem in your request ${requestProperties.body}`});
    }
};
handler._users.get = (requestProperties, callback)=>{
    //check the phone number
    const phone = typeof(requestProperties.queryString.phone) === 'string' && requestProperties.queryString.phone.trim().length === 11 ? requestProperties.queryString.phone : false;
    if(phone){
        // verify token 
        const token = typeof(requestProperties.requestHeader.token) === 'string'  ? requestProperties.requestHeader.token : false;
        tokenHandler._token.verify(token, phone, (tokenId)=>{
            if(tokenId){
                 //lookup the user
                data.read('users',phone,(err,result)=>{
                    const user = {...parseJSON(result)}
                    if(!err && user){
                        delete user.password;
                        callback(200,{user:user});
                    }else{
                        callback(404,{error:"Requested user not found!!"})
                    }
                })
            }else{
                callback(403,{error:"Authentication failure!!"})
            }
        })
       
    }else{
        callback(404,{error:"Requested user not found!!"})
    }
};
handler._users.put = (requestProperties, callback)=>{
      //check the phone number
      const firstName = typeof(requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

      const lastName = typeof(requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;
  
      const phone = typeof(requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;
  
      const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;
        if(phone){
              if(firstName || lastName || password){
                  // verify token 
        const token = typeof(requestProperties.requestHeader.token) === 'string'  ? requestProperties.requestHeader.token : false;
        tokenHandler._token.verify(token, phone, (tokenId)=>{
            if(tokenId){
                  //lookup user data
                  data.read('users',phone,(err,result)=>{
                    const userData ={...parseJSON(result)}
                    if(!err && userData){
                        if(firstName){
                            userData.firstName = firstName;
                        }
                        if(lastName){
                            userData.lastName = lastName;
                        }
                        if(password){
                            userData.password = hash(password);
                        }

                        // update user data 
                        data.update('users',phone,userData,(err)=>{
                            if(!err){
                                callback(200,{message:"Data update Successfully"})
                            }else{
                                callback(500,{error:"There was a problem in server!!"}) 
                            }
                        })
                    }else{
                        callback(404,{error:"user data not found!!"}) 
                    }
                })
            }else{
                callback(403,{error:"Authentication failure!!"})
            }
        })   
             
              }else{
                  callback(404,{error:"You have a problem in your request!!"})
              }
      }else{
          callback(404,{error:"Phone number not valid!!"})
      }
};
handler._users.delete = (requestProperties, callback)=>{
    const phone = typeof(requestProperties.queryString.phone) === 'string' && requestProperties.queryString.phone.trim().length === 11 ? requestProperties.queryString.phone : false;
    if(phone){
         // verify token 
         const token = typeof(requestProperties.requestHeader.token) === 'string'  ? requestProperties.requestHeader.token : false;
         tokenHandler._token.verify(token, phone, (tokenId)=>{
             if(tokenId){
                   //lookup user data
                data.read('users',phone,(err,myData)=>{
                    if(!err && myData){
                        data.delete('users',phone,(err)=>{
                            if(!err){
                                callback(200,{error:"User delete Successfully"}) 
                            }else{
                                callback(500,{error:"There was a server error"}) 
                            }
                        })
                    }else{
                        callback(500,{error:"There was a server error"}) 
                    }
                })
             }else{
                 callback(403,{error:"Authentication failure!!"})
             }
         })
      
    }else{
        callback(404,{error:"There was a problem in your request!!!"})
    }
};

module.exports = handler;