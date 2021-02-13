class Functions{

    static firstCharLowerCase(input){

        let ending = input.substring(1);

        return `${input[0].toLowerCase()}${ending}`;
    }

    //default value is optional
    static setValueIfUndefined(input, defaultValue){

        if(defaultValue === undefined) defaultValue = 0;

        if(input !== undefined){
            if(input === null){
                return defaultValue;
            }
        }
        
        if(input === undefined) return defaultValue;

        return input;
    }


    static calculateKillEfficiency(kills, deaths){
        
        if(kills === 0) return 0;
        if(deaths === 0 && kills > 0) return 100;
        
        return (kills / (kills + deaths)) * 100;
    }
    

    static getPlayer = (players, id) =>{

        for(let i = 0; i < players.length; i++){
    
            if(players[i].id === id){
                return players[i];
            }
        }
    
        return {"name": "not found", "country": "xx", "team": 0}
    }


    static getTeamColor(team){

        switch(team){
            case 0: {  return "team-red"; } ;
            case 1: {  return "team-blue"; } ;
            case 2: {  return "team-green"; } ;
            case 3: {  return "team-yellow"; };
            default: { return "team-none";} ;
        }
    }

    static getTeamName(team){

        let teamName = '';

        switch(team){

            case 0: { teamName = "Red Team"; } break;
            case 1: { teamName = "Blue Team"; } break;
            case 2: { teamName = "Green Team"; } break;
            case 3: { teamName = "Yellow Team"; } break;
            default: { teamName = "None Team"; } break;
        }


        return teamName;
    }


    static removeIps(data){

        if(data !== undefined){

            if(data !== null){

                for(let i = 0; i < data.length; i++){

                    if(data[i].ip !== undefined){
                        delete data[i].ip;
                    }
                }
            }
        }

        return data;
    }

}

module.exports = Functions;