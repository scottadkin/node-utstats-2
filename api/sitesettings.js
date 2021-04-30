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


    updateSetting(category, name, value){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_site_settings SET value=? WHERE category=? AND name=?";

            mysql.query(query, [value, category, name], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async updateSettings(data, category){

        try{

            let d = 0;
            

            for(let i = 0; i < data.length; i++){

                d = data[i];

                console.log(`update ${category}.${d.name} to ${d.value}`);

                await this.updateSetting(category, d.name, d.value);
            }

            return true;

        }catch(err){
            console.trace(err);
            return false;
        }
    }
}

module.exports = SiteSettings;