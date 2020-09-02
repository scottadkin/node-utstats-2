const PlayerInfo = require('./playerinfo');
const Message = require('../message');

class PlayerManager{


    constructor(data){

        this.data = data;

        this.players = [];


        this.handleConnections();

        console.log(this.players);

    }

    getPlayerById(id){

        for(let i = 0; i < this.players.length; i++){

            if(this.players[i].id === id){
                return this.players[i];
            }
        }

        return null;
    }

    handleConnections(){

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

    connectPlayer(timeStamp, string){

        const connectReg = /^(.+?)\t(.+?)\t(.+?)$/i

        const result = connectReg.exec(string);  

        if(result !== null){

            const player = this.getPlayerById(parseInt(result[2]));

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
        }
    }

}

module.exports = PlayerManager;