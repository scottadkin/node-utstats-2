const mysql = require('./database');

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

    static async insertNewCountry(code, country, date){

        const query = "INSERT INTO nstats_visitors_countries VALUES(NULL,?,?,?,?,1)";

        await mysql.simpleInsert(query, [code, country, date, date]);
    }

    static async updateVisitorCountryHistory(countryData, date){

        try{

            const code = countryData.code;
            const country = countryData.country;
            
            const query = "UPDATE nstats_visitors_countries SET last=?,total=total+1 WHERE code=?";

            const changed = await mysql.updateReturnAffectedRows(query, [date, code]);

            if(changed === 0){
                await this.insertNewCountry(code, country, date);
            }

        }catch(err){
            console.trace(err);
        }
    }

    static async insertHit(ip, host){

        const query = "INSERT INTO nstats_hits VALUES(NULL,?,?)";

        const now = Math.floor(Date.now() * 0.001);

       // console.log(geo.lookup(ip));

        await mysql.simpleInsert(query, [ip, now]);

        await this.updateVisitorHistory(ip, now);

        const req = await fetch(`http://${host}/api/iplookup`, {

            "headers": {
                "Content-Type": "application/json"
            },
            "method": "POST",
            "body": JSON.stringify({"ip": ip})

        });

        const result = await req.json();


        if(result.error === undefined){

            await this.updateVisitorCountryHistory(result, now)
        }

        // this.updateVisitorCountryHistory(geo.lookup(ip), now);
    }


    async getCountriesByHits(){

        const query = "SELECT * FROM nstats_visitors_countries ORDER BY total DESC";

        return await mysql.simpleFetch(query);
    }

    async getIpsByHits(){

        const query = "SELECT * FROM nstats_visitors ORDER BY total DESC";

        return await mysql.simpleFetch(query);
    }

    async getTotalHitsPast24Hours(){

        const start = Math.floor(Date.now() * 0.001) - ((60 * 60) * 24);

        return await this.getTotalHitsBetween(start);
    }

    async getTotalHitsPastXDays(days){

        const start = Math.floor(Date.now() * 0.001) - (((60 * 60) * 24) * days);

        return await this.getTotalHitsBetween(start);
    }

    async getTotalHitsBetween(start, end){

        if(end === undefined) end = Math.floor(Date.now() * 0.001);

        const query = "SELECT COUNT(*) as total_hits FROM nstats_hits WHERE date >= ? AND date <= ?";

        const total = await mysql.simpleFetch(query, [start, end]);

        return total[0].total_hits;
    }
}

module.exports = Analytics;