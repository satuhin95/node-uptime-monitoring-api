/*
* Title: Utilities
* Description: Importent utilities function
* Author: Saifuddin
* Date:30/5/2022
*
*/
// module scaffolding
const crypto = require('crypto');
const utilities = {};
const environments = require('./environments')
//parse json string to object
utilities.parseJSON = (jsonString) =>{
    let output;

    try{
        output = JSON.parse(jsonString);
    }catch{
        output = {};
    }

    return output;
}
//hash string
utilities.hash = (str) =>{
    if(typeof(str) === 'string' && str.length > 0){
        let hash = crypto.createHmac('sha256','victoria').update('yes').digest('hex');
        return hash;
    }else{
        return false;
    }
}

//create random string
utilities.createRandomString = (strLen) =>{
  let  len = typeof(strLen)==='number' && strLen > 0 ? strLen : false;
  if(len){
    let myCharacters  = 'abcdefghijklmonpqrstuvwxyz0123456789';
    let output = '';
    for(i=1;i<=len;i++){
        let randomChar = myCharacters.charAt(Math.floor(Math.random() * 36));
        output += randomChar;
    } 
    return output;
  }else{
      return false;
  }
}

// export module 
module.exports = utilities;