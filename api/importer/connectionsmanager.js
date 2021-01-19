const Message = require('../message');
const Connections = require('../connections');

class ConnectionsManager{

    constructor(){

        this.lines = [];
        this.data = [];
        this.connections = new Connections();
    }


    parseData(playerManager){

        const connectReg = /^(\d+?\.\d+?)\tplayer\tconnect\t.+?\t(.+?)\t.+$/i;
        const disconnectReg = /^(\d+?\.\d+?)\tplayer\tdisconnect\t(.+)$/i;

        let result = 0;
        let currentPlayer = 0;

        for(let i = 0; i < this.lines.length; i++){

            if(connectReg.test(this.lines[i])){

                result = connectReg.exec(this.lines[i]);
      
                currentPlayer = playerManager.getOriginalConnectionById(result[2]);
                
                if(currentPlayer !== null){
                    this.data.push({"type": 0, "player": currentPlayer.masterId, "timestamp": parseFloat(result[1])});
                }else{
                    new Message(`ConnectionsManager.parseData currentPlayer is null (connect)`,'warning');
                }

            }else if(disconnectReg.test(this.lines[i])){

                result = disconnectReg.exec(this.lines[i]);

                currentPlayer = playerManager.getOriginalConnectionById(result[2]);

                if(currentPlayer !== null){
                    this.data.push({"type": 1, "player": currentPlayer.masterId, "timestamp": parseFloat(result[1])});
                }else{
                    new Message(`ConnectionsManager.parseData currentPlayer is null (disconnect)`,'warning');
                }
            }
        }
    }


    async insertData(matchId){

        try{

            let d = 0;

            for(let i = 0; i < this.data.length; i++){

                d = this.data[i];

                await this.connections.insert(matchId, d.timestamp, d.type, d.player);
            }

        }catch(err){
            new Message(`ConnectionsManager.insertData ${err}`,'error');
        }
    }
}



module.exports = ConnectionsManager;