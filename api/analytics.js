const mysql = require('./database');
const geo = require('geoip-lite');

class Analytics{

    constructor(){

    }


    static async insertNewVisitor(ip, date){

        const query = "INSERT INTO nstats_visitors VALUES(NULL,?,?,?,1)";

        await mysql.simpleInsert(query, [ip, date, date]);
    }

    static async updateVisitorHistory(ip, date){

        try{

            const vars = [date, ip];

            const query = "UPDATE nstats_visitors SET last=?,total=total+1 WHERE ip=?";

            const changed = await mysql.updateReturnAffectedRows(query, vars);

            if(changed === 0){
                await this.insertNewVisitor(ip, date);
            }

        }catch(err){
            console.trace(err);
        }
    }

    static async insertNewCountry(code, date){
        const query = "INSERT INTO nstats_visitors_countries VALUES(NULL,?,?,?,1)";

        await mysql.simpleInsert(query, [code, date, date]);
    }

    static async updateVisitorCountryHistory(code, date){

        try{

            if(code === null){ 
                code = "XX";
            }else{
                code = code.country;
            }

            const query = "UPDATE nstats_visitors_countries SET last=?,total=total+1 WHERE code=?";

            const changed = await mysql.updateReturnAffectedRows(query, [date, code]);

            if(changed === 0){
                await this.insertNewCountry(code, date);
            }

        }catch(err){
            console.trace(err);
        }
    }

    static async insertHit(ip){

        const query = "INSERT INTO nstats_hits VALUES(NULL,?,?)";

        const now = Math.floor(Date.now() * 0.001);



        await mysql.simpleInsert(query, [ip, now]);

        await this.updateVisitorHistory(ip, now);

        await this.updateVisitorCountryHistory(geo.lookup("222.222.222.222"), now);
    }
}

module.exports = Analytics;