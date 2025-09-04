import Message from "../message.js";
import Connections from "../connections.js";

export default class ConnectionsManager{

    constructor(playerManager){

        this.playerManager = playerManager;
        this.lines = [];
        this.data = [];
        this.connections = new Connections();
        
    }

    async insertData(matchId){

        try{

            const insertVars = [];

            for(let i = 0; i < this.playerManager.players.length; i++){

                const p = this.playerManager.players[i];

                for(let x = 0; x < p.connects.length; x++){

                    insertVars.push([matchId, p.connects[x], p.masterId, 0]);
                }

                for(let x = 0; x < p.disconnects.length; x++){

                    insertVars.push([matchId, p.disconnects[x], p.masterId, 1]);
                }
            }

            insertVars.sort((a, b) =>{

                a = a[1];
                b = b[1];

                if(a < b) return -1;
                if(a > b) return 1;
                return 0;
            });


            await this.connections.bulkInsert(insertVars);


        }catch(err){
            new Message(`ConnectionsManager.insertData ${err}`,'error');
        }
    }
}
