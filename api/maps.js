const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');
const Spawns = require('./spawns');
const fs = require('fs');

class Maps{
    
    constructor(){



    }

    bExists(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_maps FROM nstats_maps WHERE name=?";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    if(result[0].total_maps > 0){
                        resolve(true);
                    }
                }

                resolve(false);
            });
        });
    }

    insert(name, title, author, idealPlayerCount, levelEnterText, date, matchLength){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_maps VALUES(NULL,?,?,?,?,?,?,?,1,?)";

            mysql.query(query, [name, title, author, idealPlayerCount, levelEnterText, date, date, matchLength], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updatePlaytime(name, matchLength){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_maps SET playtime=playtime+?, matches=matches+1 WHERE name=?";

            mysql.query(query, [matchLength, name], (err) =>{

                if(err) reject(err);

                resolve();

            });
        });
    }

    getCurrentDates(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT last,first FROM nstats_maps WHERE name=? LIMIT 1";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    if(result.length > 0){

                        resolve(result[0]);
                    }
                }

                resolve(null);
            });
        });
    }


    updateDate(name, type, date){

        return new Promise((resolve, reject) =>{

            type = type.toLowerCase();

            if(type !== 'first'){
                type = 'last';
            }
        
            const query = `UPDATE nstats_maps SET ${type}=? WHERE name=?`;

            mysql.query(query, [date, name], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    async updateDates(name, date){

        try{

            const currentDates = await this.getCurrentDates(name);

            if(currentDates !== null){


                if(date < currentDates.first){
                    await this.updateDate(name, 'first', date);
                }

                if(date > currentDates.last){
                    await this.updateDate(name, 'last', date);
                }

            }else{
                new Message(`There are no current dates for map ${name}`,'warning');
            }

        }catch(err){
            console.trace(err);
        }
    }

    async updateStats(name, title, author, idealPlayerCount, levelEnterText, date, matchLength){

        try{

            if(!await this.bExists(name)){

                await this.insert(name, title, author, idealPlayerCount, levelEnterText, date, matchLength);

            }else{

                await this.updatePlaytime(name, matchLength);
                await this.updateDates(name, date);
            }

        }catch(err){
            console.trace(err);
        }
    }



    getId(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id FROM nstats_maps WHERE name=? LIMIT 1";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    if(result !== []) resolve(result[0].id);
                }

                resolve(null);
            });
        });
    }

    getName(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT name FROM nstats_maps WHERE id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(this.removeUnr(result[0].name));
                }

                resolve('Not Found');
            });
        });

    }


    getAll(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_maps ORDER BY name ASC";

            const data = [];

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                   
                    resolve(result);
                }

                resolve(data);
            });
        });
    }


     removeUnr(name){

        const reg = /^(.+)\.unr$/i;
    
        const result = reg.exec(name);
    
        if(result !== null){
            return result[1];
        }
        
        return name;
    }

    /**
     *  old get names by id function, use getNames instead
     * @param {*} ids 
     */

    getNamesByIds(ids){

        return new Promise((resolve, reject) =>{

            if(ids === undefined) resolve([]);
            if(ids.length === 0) resolve([]);
            
            const query = "SELECT id,name FROM nstats_maps WHERE id IN(?)";

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                const data = [];

                if(result !== undefined){
                    
                    for(let i = 0; i < result.length; i++){             
                        data.push({"id": result[i].id, "name": this.removeUnr(result[i].name)});
                    }
                }

                resolve(data);
            });
        });
    }

    

    removePrefix(name){

        const reg = /^.+?-(.+)$/i;

        const result = reg.exec(name);

        if(result !== null){
            return result[1];
        }

        return name;
    }

    async getImage(name){

        name = this.removePrefix(name);
        name = name.toLowerCase()+'.jpg';

        const files = fs.readdirSync('public/images/maps/');

        if(files.indexOf(name) !== -1){
            return `/images/maps/${name}`;
        }

        return `/images/temp.jpg`;
    }

    async getImages(names){

        const files = fs.readdirSync('public/images/maps/');

        const exists = [];

        for(let i = 0; i < names.length; i++){
            
            if(files.indexOf(`${this.removeUnr(this.removePrefix(names[i].toLowerCase()))}.jpg`) !== -1){
                exists.push(this.removeUnr(this.removePrefix(names[i].toLowerCase())));
            }
        }

        return exists;
    }

    getNames(ids){

        return new Promise((resolve, reject) =>{

            const data = {};

            const query = "SELECT id,name FROM nstats_maps WHERE id IN(?)";

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    for(let i = 0; i < result.length; i++){

                        data[result[i].id] = this.removeUnr(result[i].name);
                    }
                }

                resolve(data);
            });
        });
    }

    getTotalResults(name){

        return new Promise((resolve, reject) =>{

            if(name === undefined) name = "";

            let query = "SELECT COUNT(*) as total_results FROM nstats_maps";
            let vars = [];

            if(name !== ""){
                query = "SELECT COUNT(*) as total_results FROM nstats_maps WHERE name LIKE(?)";
                vars = [`%${name}%`];
            }

            mysql.query(query, vars, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result[0].total_results);
                }
                resolve(0);
            });
        });
    }


    get(page, perPage, name){

        return new Promise((resolve, reject) =>{

            page = parseInt(page);
            perPage = parseInt(perPage);

            if(page !== page || perPage !== perPage){
                return [];
            }

            page--;

            const start = page * perPage;

            let query = "SELECT * FROM nstats_maps ORDER BY name ASC, id DESC LIMIT ?, ?";
            let vars = [start, perPage];
            

            if(name !== ""){
                query = "SELECT * FROM nstats_maps WHERE name LIKE(?) ORDER BY name ASC, id DESC LIMIT ?, ?";
                vars = [`%${name}%`, start, perPage]
            }

            mysql.query(query, vars, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                   
                    resolve(result);
                }
                resolve([]);
            });
        });
    }


    getSingle(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_maps WHERE id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined) resolve(result);
                resolve([]);
            });
        });
    }


    getLongestMatch(id){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,playtime FROM nstats_matches WHERE map=? ORDER BY playtime DESC LIMIT 1";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve({"match": result[0].id, "playtime": result[0].playtime});
                }

                resolve({"match": -1, "playtime": -1});
            });
        });
    }


    getRecent(id, page, perPage){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nstats_matches WHERE map=? ORDER BY date DESC LIMIT ?, ?";

            page = page - 1;

            let start = perPage * page;

            mysql.query(query, [id, start, perPage], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){
                    resolve(result);
                }
                resolve([]);
            });
        });
    }

    getMatchDates(map, limit){

        return new Promise((resolve, reject) =>{

            const query = "SELECT date FROM nstats_matches WHERE map=? ORDER BY date DESC";

            mysql.query(query, [map], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    const data = [];

                    for(let i = 0; i < result.length; i++){

                        data.push(result[i].date);
                    }

                    resolve(data);
                }

                resolve([]);
            });

        });
    }

}


module.exports = Maps;