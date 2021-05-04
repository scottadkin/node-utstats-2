const mysql = require('./database');
const Promise = require('promise');
const Gametypes = require('../api/gametypes');

class SiteSettings{

    constructor(){

        this.defaultPerPageValues = [
            {"name": 5, "value": 5},
            {"name": 10, "value": 10},
            {"name": 25, "value": 25},
            {"name": 50, "value": 50},
            {"name": 75, "value": 75},
            {"name": 100, "value": 100}
        ]

        this.defaultDiplayTypes = [
            {"name": "Default", "value": 0},
            {"name": "Table", "value": 1}
        ];
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

    getPlayersPageValidSettings(){

        return {
            "Default Sort Type": [
                {"name": "Name", "value": "name"},
                {"name": "Country", "value": "country"},
                {"name": "Matches", "value": "matches"},
                {"name": "Score", "value": "score"},
                {"name": "Kills", "value": "kills"},
                {"name": "Deaths", "value": "deaths"},
                {"name": "First", "value": "first"},
                {"name": "Last", "value": "last"},
            ],
            "Default Order": [
                {"name": "Ascending", "value": "ASC"},
                {"name": "Descending", "value": "DESC"},
            ],
            "Default Display Per Page": 
                this.defaultPerPageValues,
            "Default Display Type": this.defaultDiplayTypes
        };
    }

    getHomePageValidSettings(){

        return {
            "Recent Matches Display Type": this.defaultDiplayTypes,
            "Recent Matches To Display": [
                {"name": "1", "value": 1},
                {"name": "2", "value": 2},
                {"name": "3", "value": 3},
                {"name": "4", "value": 4},
                {"name": "5", "value": 5},
                {"name": "10", "value": 10},
                {"name": "15", "value": 15},
                {"name": "20", "value": 20},
                {"name": "25", "value": 25}
            ]
        };
    }

    getRecordsPageValidSettings(){

        return {
            "Default Per Page": this.defaultPerPageValues,
            "Default Record Type": [
                {"name": "Player", "value": "0"},
                {"name": "Match", "value": "1"},
            ]
        }
    }

    getMapsPageValidSettings(){

        return {
            "Default Display Per Page": this.defaultPerPageValues,
            "Default Display Type": this.defaultDiplayTypes
        }
    }

    getPlayerPagesValidSettings(){

        return {
            "Default Recent Matches Display": this.defaultDiplayTypes,
            "Default Recent Matches Per Page": this.defaultPerPageValues
        };
    }

    async getMatchesPageValidSettings(){

        try{

            const g = new Gametypes();

            const names = await g.getAllNames();

            const nameValues = [
                {"name": "All", "value": 0}
            ];

            for(const [key, value] of Object.entries(names)){
                nameValues.push({"name": value, "value": parseInt(key)});
            }

            return {
                "Default Display Type": this.defaultDiplayTypes,
                "Default Gametype": nameValues,
                "Default Display Per Page":
                    this.defaultPerPageValues
            };

        }catch(err){
            console.trace(err);
        }
    }

    getCategorySettings(cat){

        return new Promise((resolve, reject) =>{

            const query = "SELECT name,value FROM nstats_site_settings WHERE category=?";

            mysql.query(query, [cat], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    
                    const data = {};

                    for(let i = 0; i < result.length; i++){

                        data[result[i].name] = result[i].value;
                    }

                    resolve(data);

                }

                resolve({});
            });
        });
    }
}

module.exports = SiteSettings;