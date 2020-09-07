const PlayerInfo = require('./playerinfo');
const Message = require('../message');


class PlayerManager{


    constructor(data){

        this.data = data;

        this.players = new Map();


        //console.log(this.data.reverse());
    

        this.createPlayers();
        this.setNStatsValues();
        this.parsePlayerStrings();

        //console.table(this.players);

        this.debugDisplayPlayerStats();

        //console.log(this.players);

    }

    debugDisplayPlayerStats(){

        this.players.forEach((value, key, map) =>{

            console.log(value);
        });
    }

    getPlayerById(id){

        id = parseInt(id);

        return this.players.get(id);

        /*id = parseInt(id);

        for(let i = 0; i < this.players.length; i++){

            if(this.players[i].id === id){
                return this.players[i];
            }
        }

        return null;*/
    }

    parsePlayerStrings(){

        let d = 0;
        let result = 0;
        let type = 0;
        let player = 0;

        const reg = /^(\d+\.\d+)\tplayer\t(.+?)\t(.+)$/i;
        const statReg = /^\d+\.\d+\tstat_player\t(.+?)\t(.+?)\t(.+)$/i;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(reg.test(d)){

                result = reg.exec(d);
                type = result[2].toLowerCase();

                if(type === 'team' || type === 'teamchange'){
                    this.setTeam(result[3], result[1]);
                }else if(type == 'isabot'){
                    this.setBotStatus(result[3]);
                }

            }else if(statReg.test(d)){

                result = statReg.exec(d);
                type = result[1].toLowerCase();

                player = this.getPlayerById(result[2]);

                if(player !== undefined){

                    player.setStatsValue(result[1], result[3], true);

                }else{
                    new Message(`There is no player with the id ${result[2]}(parsePlayerStrings).`,'warning');
                }
            }
        }
    }

    createPlayers(){

        let d = 0;

        const reg = /^(\d+\.\d+)\tplayer\t(.+?)\t(.+)$/i;
        
        let result = 0;
        let type = 0;
        let timeStamp = 0;
        let subString = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            result = reg.exec(d);

            if(result !== null){

                type = result[2].toLowerCase();
                timeStamp = parseFloat(result[1]);
                subString = result[3];
          
                if(type === 'connect'){
                    this.connectPlayer(timeStamp, subString);
                }else if(type === 'disconnect'){
                     this.disconnectPlayer(subString, timeStamp);
                }
            }
        }
    }

    setNStatsValues(){

        const reg = /^(\d+\.\d+)\tnstats\t(.+?)\t(.+)$/i;

        let type = 0;
        let result = 0;
        let d = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            result = reg.exec(d);

            if(result !== null){
                type = result[2].toLowerCase();
                //console.log(`type = ${type}`);

                if(type === 'face' || type === 'voice' || type === 'netspeed'){
                    this.setPlayerFeature(d);
                }
            }
        }
    }

    connectPlayer(timeStamp, string){

        const connectReg = /^(.+?)\t(.+?)\t(.+?)$/i

        const result = connectReg.exec(string);  

        if(result !== null){

            const player = this.getPlayerById(result[2]);

            if(player === undefined){
                //this.players.push(new PlayerInfo(parseInt(result[2]), result[1], timeStamp));
                this.players.set(parseInt(result[2]), new PlayerInfo(parseInt(result[2]), result[1], timeStamp));
            }else{
                player.connect(timeStamp);
            }

        }else{
            new Message(`ConnectPlayer Reg did not match for ${string}.`,'warning');
        }
    }

    disconnectPlayer(id, timeStamp){
        
        id = parseInt(id);

        const player = this.getPlayerById(id);

        if(player !== undefined){
            player.disconnect(timeStamp);
        }else{
            new Message(`Player with the id of ${id} does not exist(disconnectPlayer).`,'warning');
        }
    }

    setTeam(subString, timeStamp){

        const reg = /^(.+?)\t(.+)$/i;

        const result = reg.exec(subString);

        if(result !== null){

            const id = parseInt(result[1]);
            const team = parseInt(result[2]);
            const player = this.getPlayerById(id);

            if(player !== undefined){
                player.setTeam(timeStamp, team);      
            }else{
                new Message(`Player with the id of ${id} does not exist(setTeam).`,'warning');
            }
        }
    }
        

    setBotStatus(string){

        const reg = /^(.+?)\t(.+)$/i;

        const result = reg.exec(string);

        if(result !== null){

            let bBot = false;

            if(result[2].toLowerCase() === 'true'){
                bBot = true;
            }

            if(bBot){
                const player = this.getPlayerById(result[1]);

                if(player !== undefined){
                    player.setAsBot();
                }else{
                    new Message(`Player with the id of ${result[1]} does not exist(setBotStatus).`,'warning');
                }
            }
        }
    }

    setPlayerFeature(string){

        let reg = /^\d+\.\d+\tnstats\t(.+?)\t(.+?)\t(.+)$/i;

        const result = reg.exec(string);

        if(result !== null){

            const type = result[1].toLowerCase();

            const player = this.getPlayerById(result[2]);

            const value = result[3].toLowerCase();

            if(player !== undefined){

                if(type === 'face'){
                    player.setFace(value);
                }else if(type === 'voice'){
                    player.setVoice(value);
                }else if(type === 'netspeed'){
                    player.setNetspeed(value);
                }

            }else{
                new Message(`Player with the id of ${result[2]} does not exist(setFace).`,'warning');
            }
        }
    }


    setKills(kills){

        let k = 0;

        let killer = 0;
        let victim = 0;

        for(let i = 0; i < kills.length; i++){

            k = kills[i];

            if(k.type == 'kill'){

                killer = this.getPlayerById(k.killerId);
                victim = this.getPlayerById(k.victimId);

                if(killer !== undefined){
                    killer.killedPlayer(k.timeStamp);
                }

                if(victim !== undefined){
                    victim.died(k.timeStamp);
                }
            }
        }

        this.debugDisplayPlayerStats();
    }


}

module.exports = PlayerManager;