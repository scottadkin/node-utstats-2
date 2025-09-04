import { simpleQuery } from "../database.js";
import Message from "../message.js";

export default class CountriesManager{

    constructor(){

    }

    async insertBulk(players, date){


        try{

            const uses = {};

            let p = 0;

            for(let i = 0; i < players.length; i++){

                p = players[i];

                if(p.bDuplicate === undefined){
                    if(uses[p.country] !== undefined){
                        uses[p.country]++;
                    }else{
                        uses[p.country] = 1;
                    }
                }
            }

            for(const [key, value] of Object.entries(uses)){
                
                if(key !== 'undefined'){
                    await this.update(key, value, date);
                }
            }

        }catch(err){
            new Message(`CountriesManager.insertBulk ${err}`,'error');
        }
    }

    async exists(code){

        const query = "SELECT COUNT(*) as total_countries FROM nstats_countries WHERE code=?";

        const result = await simpleQuery(query, [code]);//
        
        return result[0].total_countries > 0;
    
    }

    async insert(code, uses, date){

        const query = "INSERT INTO nstats_countries VALUES(NULL,?,?,?,?)";

        return await simpleQuery(query, [code, date, date, uses]);
    }

    async updateQuery(code, uses, date){

        const query = `UPDATE nstats_countries SET
        total=total+?,
        first = IF(first > ?, ?, first),
        last = IF(last < ?, ?, last)
        WHERE code=?`;

        return await simpleQuery(query, [uses, date, date, date, date, code]);
    }

    async update(code, uses, date){

        try{

            if(code === undefined) return;

            if(await this.exists(code)){
                await this.updateQuery(code, uses, date);
            }else{
                await this.insert(code, uses, date);
            }


        }catch(err){
            new Message(`CountriesManager.update ${err}`, 'error');
        }
    }
}