const mysql = require('./database');

class Analytics{

    constructor(){

    }


    static async insertNewVisitor(ip, date){

        const query = "INSERT INTO nstats_visitors VALUES(NULL,?,?,?,1)";

        await mysql.simpleInsert(query, [ip, date, date]);
    }

    static async updateVistorHistory(ip, date){

        try{

            const vars = [date, ip];

            const query = "UPDATE nstats_visitors SET last=?,total=total+1 WHERE ip=?";

            const changed = await mysql.updateReturnAffectedRows(query, vars);

            if(changed === 0){
                await this.insertNewVisitor(ip, date);
            }

            console.log(`Changed = ${changed}`);

        }catch(err){
            console.trace(err);
        }
    }

    static async insertHit(ip){

        const query = "INSERT INTO nstats_hits VALUES(NULL,?,?)";

        const now = Date.now() * 0.001;

        await mysql.simpleInsert(query, [ip, now]);

        await this.updateVistorHistory(ip, now);
    }
}

module.exports = Analytics;