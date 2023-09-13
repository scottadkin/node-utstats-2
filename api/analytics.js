const mysql = require('./database');
const Message = require('./message');
const geo = require('geoip-lite');
const countries = require('./countries');

class Analytics{

    constructor(){}


    static async insertNewVisitor(ip, date){

        const query = "INSERT INTO nstats_visitors VALUES(NULL,?,?,?,1)";

        await mysql.simpleQuery(query, [ip, date, date]);
    }

    static async updateVisitorHistory(ip, date){

        try{

            if(ip === -1){

                new Message(`User ip is -1`,"error");
                ip = "Unknown";
                
            }

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

        await mysql.simpleQuery(query, [code, country, date, date]);
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

    static async insertUserAgent(system, platform, date){

        const query = "INSERT INTO nstats_user_agents VALUES(NULL,?,?,?,?,1)";

        await mysql.simpleQuery(query, [system, platform, date, date]);
    }

    static findBrowserName(agent){

        const firefox = /firefox\/.+?/i;
        const seamonkeyCheck = /seamonkey\/.+?/i;

        const chromeCheck = /chrome\/.+?/i;
        const chromiumCheck = /chromium\/.+?/i;

        const safariCheck = /safari\/.+?/i;

        const operaCheck = /(OPR|opera)\/.+?/i;

        const ie10Check = /; msie .+?;/i;
        const ie11Check = /Trident\/7.0; rv:.+?/i;

        const testEdgeCheck = /edg\/.+?/i;


        if(firefox.test(agent) && !seamonkeyCheck.test(agent)){
            return "Firefox";
        }

        if(seamonkeyCheck.test(agent)){
            return "Seamonkey";
        }

        if(testEdgeCheck.test(agent)){
            return "Edge";
        }

        if(chromeCheck.test(agent) && !chromiumCheck.test(agent) && !operaCheck.test(agent)){
            return "Chrome";
        }

        if(chromiumCheck.test(agent)){
            return "Chromium";
        }

        if(safariCheck.test(agent) && !chromiumCheck.test(agent) && !chromeCheck.test(agent)){
            return "Safari";
        }

        if(operaCheck.test(agent)){
            return "Opera";
        }

        if(ie10Check.test(agent)){
            return "Internet Explorer 10";
        }

        if(ie11Check.test(agent)){
            return "Internet Explorer 11";
        }


        return "Unknown";


    }

    static async updateUserAgent(agent){

        //Mozilla/[version] ([system and browser information]) [platform] ([platform details]) [extensions]. 
        const reg = /.+?\((.+?)\)(.+?).+?.+/i;

        const result = reg.exec(agent);


        if(result !== null){

            const system = result[1];

            const now = Math.floor(Date.now() * 0.001);

            const query = "UPDATE nstats_user_agents SET last=?,total=total+1 WHERE system_name=? AND browser=?";

            const browser = this.findBrowserName(agent);

            const changedRows = await mysql.updateReturnAffectedRows(query, [now, system, browser]);


            if(changedRows === 0){

                await this.insertUserAgent(system, browser, now);
            }

        }else{

            //check for bots here
        }

    }

    static async insertHit(ip, host, userAgent){


        await this.updateUserAgent(userAgent);

        const query = "INSERT INTO nstats_hits VALUES(NULL,?,?)";

        const now = Math.floor(Date.now() * 0.001);

        await mysql.simpleQuery(query, [ip, now]);

        await this.updateVisitorHistory(ip, now);
        
        const iplookup = geo.lookup(ip);

        if(iplookup !== null){

            const countryData = countries(iplookup.country);

            await this.updateVisitorCountryHistory(countryData, now);

        }else{

            await this.updateVisitorCountryHistory({"country": "Unknown", "code": "XX"}, now);
        }
        
    }


    async getCountriesByHits(){

        const query = "SELECT code,country,first,last,total FROM nstats_visitors_countries ORDER BY total DESC";

        return await mysql.simpleQuery(query);
    }

    async getIpsByHits(limit){

        const query = "SELECT * FROM nstats_visitors ORDER BY total DESC LIMIT ?";

        return await mysql.simpleQuery(query, [limit]);
    }

    daysToSeconds(days){

        return Math.floor(Date.now() * 0.001) - (((60 * 60) * 24) * days);
    }

    async getTotalHitsPastXDays(days){

        let start = 0;

        if(days !== undefined){
            start = this.daysToSeconds(days);
        }

        return await this.getTotalHitsBetween(start);
    }

    async getTotalHitsBetween(start, end){

        if(end === undefined) end = Math.floor(Date.now() * 0.001);

        const query = "SELECT COUNT(*) as total_hits FROM nstats_hits WHERE date >= ? AND date <= ?";

        const total = await mysql.simpleQuery(query, [start, end]);

        return total[0].total_hits;
    }

    async getVisitorCountBetween(start, end){

        if(end === undefined) end = Math.floor(Date.now() * 0.001);

        const query = "SELECT COUNT(*) as hits FROM nstats_hits WHERE date >= ? AND date <= ? GROUP BY (ip)";

        const data = await mysql.simpleQuery(query, [start, end]);

        let returning = 0;

        let d = 0;
        
        for(let i = 0; i < data.length; i++){

            d = data[i];

            if(d.hits > 1){
                returning++;
            }
        }

        return {"unique": data.length, "returning": returning};

    }

    async getVisitorsCountPastXDays(days){

        let start = 0;

        if(days !== undefined){
            start = this.daysToSeconds(days);
        }

        return await this.getVisitorCountBetween(start);
    }

    async getUserAgents(){

        const query = "SELECT * FROM nstats_user_agents ORDER BY total DESC";
        return await mysql.simpleQuery(query);
    }


    async adminGetHits(){

        const range = 60 * 60 * 24 * 365;
        const now = Math.floor(Date.now() * 0.001);

        const query = `SELECT ip,date FROM nstats_hits WHERE date>=? AND date<=? ORDER BY date ASC`;

        const result = await mysql.simpleQuery(query, [now - range, now]);


        //TODO: do unique hits per time frame instead of just any, store unique ips
        const hits = {
            "unique": {
                "day": [],
                "week": [],
                "month": [],
                "year": [],
            },
            "any": {
                "day": [],
                "week": [],
                "month": [],
                "year": [],
            }
        };

        for(let i = 0; i < 365; i++){

            if(i < 7){
                hits.any.week.push(0);
                hits.unique.week.push(new Set());
            }
            if(i < 24){
                hits.any.day.push(0);
                hits.unique.day.push(new Set());
            }
            if(i < 28){
                hits.any.month.push(0);
                hits.unique.month.push(new Set());
            }
            hits.any.year.push(0);
            hits.unique.year.push(new Set());
            
        }


        const hour = 60 * 60;
        const day = hour * 24;

        for(let i = 0; i < result.length; i++){

            const {ip, date} = result[i];

            let offset = Math.floor(now - date);
            //:eyes: An offset of 1 second makes no difference to the data we display
            if(offset === 0) offset = 1;
            const hourOffset = Math.floor(offset / hour);
            const dayOffset = Math.floor(offset / day);

            if(hourOffset < 24){
                hits.any.day[hourOffset]++;
                hits.unique.day[hourOffset].add(ip);
            }

            if(dayOffset < 7){
                hits.any.week[dayOffset]++;
                hits.unique.week[dayOffset].add(ip);
            }
            if(dayOffset < 28){
                hits.any.month[dayOffset]++;
                hits.unique.month[dayOffset].add(ip);
            }

            hits.any.year[dayOffset]++;
            hits.unique.year[dayOffset].add(ip);
        }

        const graphData = [
            [
                {
                    "name": "Page Views", 
                    "values": hits.any.day
                },
                {
                    "name": "Unique Views", 
                    "values": hits.unique.day.map((d) =>{
                        return d.size;
                    })
                },
            ],
            [
                {
                    "name": "Page Views", 
                    "values": hits.any.week
                },
                {
                    "name": "Unique Views",
                    "values": hits.unique.week.map((d) =>{
                        return d.size;
                    })
                }
            ],
            [
                {
                    "name": "Page Views", 
                    "values": hits.any.month
                },
                {
                    "name": "Unique Views",
                    "values": hits.unique.month.map((d) =>{
                        return d.size;
                    })
                }
            ],
            [
                {
                    "name": "Page Views", 
                    "values": hits.any.year 
                },
                {
                    "name": "Unique Views",
                    "values": hits.unique.year.map((d) =>{
                        return d.size;
                    })
                }
            ]
        ];

        return graphData;
    }
}


module.exports = Analytics;