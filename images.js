const express = require('express')
const app = express()
const path = require("path");
app.use(express.static(path.join(__dirname, '/public')));

const fs = require("fs");
 
app.get("/get", function (req, res){

    const root = `/public/`;
    const host = req.headers.host;

    const query = req.query;

    console.log(query.file);

    const fileName = path.basename(query.file);
    console.log(fileName);
    let pathName = path.dirname(query.file);
    console.log(pathName);

    if(!pathName.endsWith("/")){
        pathName += `/`;
    }

    console.log(pathName);

    if(query.file !== undefined){

        fs.stat(`.${root}${query.file}`, (err, stats) =>{

            if(err){
                res.send(`${host}/images/temp.jpg`);
            }else{
                res.send(`${host}/${pathName}${fileName}`);
            }       
        });
    }

});
 
app.listen(3001);