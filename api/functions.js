class Functions{

    static firstCharLowerCase(input){

        let ending = input.substring(1);

        return `${input[0].toLowerCase()}${ending}`;
    }

    //default value is optional
    static setValueIfUndefined(input, defaultValue){

        if(defaultValue === undefined) defaultValue = 0;
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

}

module.exports = Functions;