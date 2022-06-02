const fs = require('fs');
const path = require('path');

const lib = {};

// base directory of the data folder 

lib.basedir = path.join(__dirname, '/../.data/');

// write data to file 

lib.create = (dir, file, data, callback)=>{
    // open file for writing 
    fs.open(`${lib.basedir+dir}/${file}.json`, 'wx', (err, fileDescriptor)=>{
        if(!err && fileDescriptor){
            // convert data to string 
            const stringDate = JSON.stringify(data);

            // write data to file and then colse it 
            fs.writeFile(fileDescriptor,stringDate, (err)=>{
                if(!err){
                    fs.close(fileDescriptor, (error)=>{
                        if(!error){
                            callback(false);
                        }else{
                            callback('Error closing the new file!');
                        }
                    })
                }else{
                    callback('Error writing to file!');
                }
            })
        }else{
            callback("Could not create new file, it may already exists!");
        }
    })
};
// Read data to file 
lib.read = (dir, file, callback)=>{
    fs.readFile(`${lib.basedir+dir}/${file}.json`,'utf-8',(err,data)=>{
        callback(err,data);
    })
}
// update data to file 
lib.update= (dir,file,data,callback)=>{
    // file open to write 
    fs.open(`${lib.basedir+dir}/${file}.json`,'r+',(err, fileDescriptor)=>{
        if(!err && fileDescriptor){
            // convert the data to string 
            const stringData = JSON.stringify(data);

            //  truncate the file 
            fs.ftruncate(fileDescriptor,(err)=>{
                if(!err){
                    // write to file and close it
                    fs.writeFile(fileDescriptor,stringData,(err)=>{
                        if(!err){
                            fs.close(fileDescriptor,(error)=>{
                                if(!error){
                                    callback(false);
                                }else{
                                    callback("error closing file!");
                                }
                            })
                        }else{
                            callback("Error to Updating Data");
                        }
                    })

                }else{
                    callback('Error truncationg file!');
                }
            })
        }else{
            console.log('Error Updating. File may not exist');
        }
    })
}
// delete file 
lib.delete=(dir,file,callback)=>{
    //unlink file
    fs.unlink(`${lib.basedir+dir}/${file}.json`,(err)=>{
        if(!err){
            callback(false);
        }else{
            callback('Error Deleteing File!');
        }
    })
}

// list all the items in a directory
lib.list =(dir, callback)=>{
    fs.readdir(`${lib.basedir+dir}/`,(err, filesName)=>{
        if(!err && filesName && filesName.length > 0){
            let trimmedFileName =[];
            filesName.forEach(fileName =>{
                trimmedFileName.push(fileName.replace('.json',''));
            });
            callback(false, trimmedFileName);
        }else{
            callback('Error reading directory!');
        }
    })
};
module.exports = lib;
