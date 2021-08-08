import mysql from './database';
import Players from './players';

class Records{

    constructor(){

        this.validTypes = {
            "score": {"column": "gamescore", "display": "Score"},
            "frags": {"column": "frags", "display": "Frags"},
            "kills": {"column": "kills", "display": "Kills"},
            "deaths": {"column": "deaths", "display": "Deaths"},
            "suicides": {"column": "suicides", "display": "Suicides"},
            "teamkills": {"column": "teamkills", "display": "Team Kills"},
            "monsters": {"column": "spree_monster", "display": "Monster Kills"},
            "godlikes": {"column": "spree_god", "display": "Godlikes"},
            "playtime": {"column": "gametime", "display": "Playtime"}
        };

        this.players = new Players();
    }

    async getDefault(){

        const records = [];

        for(const [key, value] of Object.entries(this.validTypes)){
           
            records.push(await this.getType(key, 1, 10));
          
        }

        return records;
    }

    bValidType(type){

        type = type.toLowerCase();

        const keys = Object.keys(this.validTypes);

        if(keys.indexOf(type) !== undefined) return true;

        return false;
    }

    async getType(name, page, perPage){

        if(this.bValidType(name)){

            const typeValues = this.validTypes[name];

            const query = `SELECT matchid,pid,team,country,${typeValues.column} as value FROM uts_player ORDER BY value DESC LIMIT ?, ?`;

            const result = await mysql.simpleQuery(query, [page, perPage]);

            return {"name": typeValues.display, "data": result}

        }

        return [];
    }
}

export default Records;