const Message = require('../message');
const Connections = require('../connections');

class ConnectionsManager{

    constructor(playerManager){

        this.playerManager = playerManager;
        this.lines = [];
        this.data = [];
        this.connections = new Connections();
        
    }

    connect(line, reg){

        const result = reg.exec(line);

        const playerId = parseInt(result[2]);
    
        const currentPlayer = this.playerManager.getPlayerById(playerId);

        if(currentPlayer === null){

            new Message(`ConnectionsManager.connect currentPlayer is null`,'warning');
            return;
        }
 
        if(this.playerManager.bIgnoreBots && currentPlayer.bBot) return;

        const timestamp = parseFloat(result[1]);

        //to prevent duplicate entries, rename is always logged first,
        //if there is also a connect event the player is a player, otherwise a spectator
        //if(currentPlayer.bConnectedToServer){
        //    currentPlayer.bSpectator = false;
        //}else{
        //    currentPlayer.connect(timestamp, false);
       // }
    
        this.data.push({"type": 0, "player": currentPlayer.masterId, "timestamp": timestamp});
        
    }


    disconnect(line, reg){

        const result = reg.exec(line);

        const currentPlayer = this.playerManager.getPlayerById(result[2]);

        if(currentPlayer === null){
            new Message(`ConnectionsManager.disconnect currentPlayer is null`,'warning');
            return;
        }

        if(this.playerManager.bIgnoreBots && currentPlayer.bBot) return;

        const timestamp = parseFloat(result[1]);

       // currentPlayer.disconnect(timestamp);

        this.data.push({"type": 1, "player": currentPlayer.masterId, "timestamp": timestamp});
    }

    rename(line, reg){

        const result = reg.exec(line);

        const timestamp = parseFloat(result[1]);
        const playerName = result[2];
        const playerId = result[3];

        const player = this.playerManager.getPlayerById(playerId);

        //set player to spectator, if there is also a connect event they will later be set to player
        //if(!player.bConnectedToServer){
           // player.connect(timestamp, true);
        //}

    }

    parseData(){

        const connectReg = /^(\d+?\.\d+?)\tplayer\tconnect\t.+?\t(.+?)\t.+$/i;
        const disconnectReg = /^(\d+?\.\d+?)\tplayer\tdisconnect\t(.+)$/i;
        const renameReg = /^(\d+?\.\d+?)\tplayer\trename\t(.+?)\t(.+)$/i;

        for(let i = 0; i < this.lines.length; i++){

            const line = this.lines[i];

            if(connectReg.test(line)){

                this.connect(line, connectReg);

            }else if(disconnectReg.test(line)){

                this.disconnect(line, disconnectReg);

            }else if(renameReg.test(line)){
                this.rename(line, renameReg);
            }   
        }
    }

    async insertData(matchId){

        try{

            const insertVars = [];


            for(let i = 0; i < this.data.length; i++){

                const d = this.data[i];

                if(d.type < 2){
                    insertVars.push([matchId, d.timestamp, d.player, d.type]);
                }
            }

            await this.connections.bulkInsert(insertVars);

        }catch(err){
            new Message(`ConnectionsManager.insertData ${err}`,'error');
        }
    }
}



module.exports = ConnectionsManager;