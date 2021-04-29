const mysql = require('./database');
const Promise = require('promise');

class SiteSettings{

    constructor(){

    }


    debugGetAllSettings(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_site_settings ORDER BY category ASC, name ASC";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }

                resolve([]);
            });

        });
    }
}

module.exports = SiteSettings;