/*
* Title: token Handler
* Description: token Handler to handle token related routes
* Author: Saifuddin
* Date:30/5/2022
*
*/

//dependencies
const data = require('../../lib/data');
const {hash, parseJSON,createRandomString} = require('../../helper/utilities')
// moduel scaffolding

const handler ={};

handler.tokenHandler=( requestProperties, callback)=>{
const acceptedMethods =['get','post','put','delete'];
    if(acceptedMethods.indexOf(requestProperties.method)> -1){
        handler._token[requestProperties.method](requestProperties, callback);
    }else{
        callback(405);
    }
};
handler._token = {};

handler._token.post = (requestProperties, callback)=>{
    const phone = typeof(requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;
    if(phone && password){
        data.read('users',phone,(err,result)=>{
        const userData ={...parseJSON(result)};
           let hashPass = hash(password);
           if(hashPass===userData.password){
                let tokenId = createRandomString(20);
                let expires = Date.now() + 60 * 60 * 1000;

                let tokenObj ={
                    phone,
                    expires,
                    'id':tokenId
                };

                // store the token 
                data.create('tokens',tokenId,tokenObj,(err)=>{
                    if(!err){
                        callback(200,tokenObj);
                    }else{
                        callback(500,{error:"There was a problem in server!!"}) 
                    }
                })
           }else{
            callback(404,{error:"Password is not password!!"})
           }
        })
    }else{
        callback(400,{error:"You have a problem in your request!!"})
    }
};
handler._token.get = (requestProperties, callback)=>{
    //check the id 
    const id = typeof(requestProperties.queryString.id) === 'string' && requestProperties.queryString.id.trim().length === 20 ? requestProperties.queryString.id : false;
    if(id){
        //lookup the token
        data.read('tokens',id,(err,result)=>{
            const token = {...parseJSON(result)}
            if(!err && token){
                callback(200,token);
            }else{
                callback(404,{error:"Requested token not found!!"})
            }
        })
    }else{
        callback(404,{error:"Requested token not found!!"})
    }

};
handler._token.put = (requestProperties, callback)=>{
    const id = typeof(requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;
    const extend = typeof(requestProperties.body.extend) === 'boolean' && requestProperties.body.extend === true ? true: false;
    if(id && extend){
        // lookup token data 
        data.read('tokens', id, (err1 ,result)=>{
            const tokenObj = parseJSON(result);
            if(tokenObj.expires > Date.now()){
                tokenObj.expires = Date.now() + 60 * 60 * 1000;
                // store the updated token 
                data.update('tokens', id,tokenObj,(err)=>{
                    if(!err){
                        callback(200);
                    }else{
                        callback(500,{error:"There was a server side error!!"})
                    }
                })
            }else{
                callback(400,{error:"Token already expired!!"})
            }
        })
    }else{
        callback(400,{error:"There was a problem in your request!!"})
   }
};
handler._token.delete = (requestProperties, callback)=>{
    const id = typeof(requestProperties.queryString.id) === 'string' && requestProperties.queryString.id.trim().length === 20 ? requestProperties.queryString.id : false;
    if(id){
        //lookup id data
        data.read('tokens',id,(err,myData)=>{
            if(!err && myData){
                data.delete('tokens',id,(err)=>{
                    if(!err){
                        callback(200,{error:"Token delete Successfully"}) 
                    }else{
                        callback(500,{error:"There was a server error"}) 
                    }
                })
            }else{
                callback(500,{error:"There was a server error"}) 
            }
        })
    }else{
        callback(404,{error:"There was a problem in your request!!!"})
    }
};
handler._token.verify =(id, phone, callback)=>{
    data.read('tokens',id,(err,result)=>{
        if(!err && result){
            if(parseJSON(result).phone === phone && parseJSON(result).expires > Date.now()){
                callback(true);
            }else{
                callback(false);
            }
        }else{
            callback(false);
        }
    })
}

module.exports = handler;