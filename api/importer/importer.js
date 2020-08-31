const config = require('../config.json');
const Database = require('../database');
const Promise = require('promise');
const FTPImporter = require('./ftpimporter');
const fs = require('fs');


class Importer{

    constructor(){

        this.ftpImporter = new FTPImporter();

        this.ftpImporter.events.on('finished', () =>{

            console.log('event potato');

        });
    }

    


}

module.exports = Importer;