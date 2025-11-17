import { bulkInsert, simpleQuery } from "./database.js";
import countries from "./countries.js";

export default class CountriesManager{

    constructor(){}


    async getMostPopular(limit){

        if(limit === undefined) limit = 5;

        const query = `SELECT COUNT(*) as total_uses, 
        nstats_player.country, 
        MIN(nstats_player_totals.first) as first_match, 
        MAX(nstats_player_totals.last) as last_match
        FROM nstats_player 
        INNER JOIN nstats_player_totals ON nstats_player_totals.player_id = nstats_player.id AND nstats_player_totals.gametype=0 AND nstats_player_totals.map=0
        WHERE nstats_player.country!="xx"

        GROUP BY(nstats_player.country) ORDER BY total_uses DESC LIMIT ?`;

        const result = await simpleQuery(query, [limit]);

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            const currentCountry = countries(r.country);
            r.countryName = currentCountry.country;
            r.country = currentCountry.code;
        }

        
        return result;
    }

    async reduceUses(code, amount){

        const query = "UPDATE nstats_countries SET total=total-? WHERE code=?";

        return await simpleQuery(query, [amount, code]);

    }

    async deletePlayerViaMatchData(matches){

        try{

            const uses = {};

            let m = 0;

            for(let i = 0; i < matches.length; i++){

                m = matches[i];

                if(uses[m.country] === undefined){
                    uses[m.country] = 0;
                }

                uses[m.country]++;
            }

            for(const [key, value] of Object.entries(uses)){
                await this.reduceUses(key, value);
            }

        }catch(err){
            console.trace(err);
        }
    }

    countCountriesUses(playerMatchData){

        const uses = {};

        for(let i = 0; i < playerMatchData.length; i++){

            const p = playerMatchData[i];

            if(uses[p.country] === undefined){
                uses[p.country] = 0;
            }
            
            uses[p.country]++;
        }
        

        return uses;
    }
}


async function deleteAllTotals(){

    const query = `DELETE FROM nstats_countries`;
    return await simpleQuery(query);
}

async function bulkInsertTotals(data){

    const query = `INSERT INTO nstats_countries (code,first,last,total) VALUES ?`;

    const insertVars = data.map((d) =>{
        return [d.country, d.first_used, d.last_used, d.total_uses];
    });

    return await bulkInsert(query, insertVars);
}

export async function recalculateTotals(){


    await deleteAllTotals();

    const query = `SELECT COUNT(*) as total_uses,country,MIN(match_date) as first_used,
    MAX(match_date) as last_used FROM nstats_player_matches GROUP BY country`;

    const result = await simpleQuery(query);

    if(result.length === 0) return;

    await bulkInsertTotals(result);


}