/*
* Title: Worker library
* Description: Worker related files
* Author: Saifuddin
* Date:1/6/2022
*
*/

// dependencies s
const data = require('./data');
const { parseJSON} = require('../helper/utilities')
const url = require('url');
const http = require('http');
const https = require('https');
const {sendTwilioSms} = require('../helper/notification')
//  worker object 
const worker ={};
    // lookup all the checks 
    worker.gaterAllChecks = ()=>{
        // get all the checks
        data.list('checks',(err, checks)=>{
            if(!err && checks && checks.length >0){
                checks.forEach(check =>{
                    // read the check data
                    data.read('checks',check, (err,result)=>{
                        if(!err && result){
                            // pass the data to the check validator
                            worker.validateCheckData(parseJSON(result));
                        }else{
                            console.log('Error: reading one of the checks data!!')
                        }
                    })
                })
            }else{
                console.log("Error: Could not find any checks in process!!");
            }
        })
    }
 
     // validate individual check data
     worker.validateCheckData = (originalCheckData)=>{
        if(originalCheckData && originalCheckData.id){
            originalCheckData.state = typeof(originalCheckData.state)==="string" && ['up','down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state:'down';

            originalCheckData.lastChecked = typeof(originalCheckData.lastChecked)==='number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked: false;

            // pass to the next process

            worker.performCheck(originalCheckData);
        }else{
            console.log("Error: Check was invalid or not properly formatted!!");
        }
     };
     // perforam check
     worker.performCheck = (originalCheckData)=>{
         // prepare the initial check outcome
         let  checkOutCome ={
             error:false,
             responseCode:false
         };
         // mark the outcome has not been send yet
            let outcomeSend = false;
         // parse the hostname & full url from orginal data
         const parseUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url, true);
         const hostname = parseUrl.hostname;
         const path = parseUrl.path;

         // construct the request

         const requestDetails ={
             protocol:`${originalCheckData.protocol}:`,
             hostname:hostname,
             method: originalCheckData.method.toUpperCase(),
             path:path,
             timeout:originalCheckData.timeoutSeconds * 1000,
         };

         const protocolUse = originalCheckData.protocol==='http'? http : https;

         const req = protocolUse.request(requestDetails, (response)=>{
             const status = response.statusCode;
             // update the check outcome and pass to the next process
             checkOutCome.responseCode =status;
             if(!outcomeSend){
                 worker.processCheckOutCome(originalCheckData,checkOutCome);
                 outcomeSend=true;
             }
         });

         req.on('error',(e)=>{
              checkOutCome ={
                error:true,
                value:e,
            };
            if(!outcomeSend){
                worker.processCheckOutCome(originalCheckData,checkOutCome);
                outcomeSend=true;
            }
         });

         req.on('timeout',(e)=>{
            checkOutCome ={
                error:true,
                value:'timeout',
            };
            if(!outcomeSend){
                worker.processCheckOutCome(originalCheckData,checkOutCome);
                outcomeSend=true;
            }
         });

         // req send
         req.end();

     };
  // save check outcome to database and send to next process
worker.processCheckOutCome =(originalCheckData,checkOutCome)=>{
    // check if check outcome is up or down
    let state = !checkOutCome.error && checkOutCome.responseCode && originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down';

    // decide whether we should alert the user or not
    const alertWanted = originalCheckData.lastChecked && originalCheckData.state === state ? true : false;

    // update the check data
    let newCheckData = originalCheckData;

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    //update check
    data.update('checks', newCheckData.id, newCheckData, (err)=>{
        if(!err){
            if(alertWanted){
            //send the check data to process
            worker.alertUserToStatusChange(newCheckData);
        }else{
            // console.log('Alert is not needed as there is no state change!!')
            console.log(err);
        }
        }else{
            console.log('Error: Trying to save check data of one of the checks!!');
        }
    })


}

// send notification sms to user if state change
worker.alertUserToStatusChange = (newCheckData)=>{
    let msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}:// ${newCheckData.url} is currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.userPhone, msg, (err)=>{
        if(!err){
            console.log(`User was alerted to a status change via SMS ${msg}`);
        }else{
            console.log("There was a problem sending sms to one of the user");
        }
    })
}
// timers to execute the worker process once per minute
    worker.loop =()=>{
        setInterval(()=>{
            worker.gaterAllChecks();
        },1000 * 60);
    }



// start the workers
worker.init =()=>{
   // execute all the checks
   worker.gaterAllChecks();


   // call the loop so that checks continue
   worker.loop();
};

// exports 
module.exports = worker;



