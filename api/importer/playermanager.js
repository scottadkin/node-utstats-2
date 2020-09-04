const PlayerInfo = require('./playerinfo');
const Message = require('../message');

class PlayerManager{


    constructor(data){

        this.data = data;

        this.players = [];


        this.createPlayers();
        this.setNStatsValues();
        //this.setTeams();

        //console.log(this.players);

    }

    getPlayerById(id){

        id = parseInt(id);

        for(let i = 0; i < this.players.length; i++){

            if(this.players[i].id === id){
                return this.players[i];
            }
        }

        return null;
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
                }else if(type === 'team' || type == "teamchange"){
                    this.setTeam(subString, timeStamp);
                }else if(type === 'isabot'){
                    this.setBotStatus(subString);
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

            if(player === null){
                this.players.push(new PlayerInfo(parseInt(result[2]), result[1], timeStamp));
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

        if(player !== null){
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

            if(player !== null){
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

                if(player !== null){
                    player.setAsBot();
                }else{
                    new Message(`Player with the id of ${id} does not exist(setBotStatus).`,'warning');
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

            if(player !== null){

                if(type === 'face'){
                    player.setFace(result[3].toLowerCase());
                }else if(type === 'voice'){
                    player.setVoice(result[3].toLowerCase());
                }else if(type === 'netspeed'){
                    player.setNetspeed(result[3]);
                }

            }else{
                new Message(`Player with the id of ${id} does not exist(setFace).`,'warning');
            }
        }
    }


}

module.exports = PlayerManager;