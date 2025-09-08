const dgram = require("node:dgram");
const EventEmitter = require("node:events");
class UTQueryEmitter extends EventEmitter{};

class UTServerQuery{

    constructor(){  

        this.pending = [];

        this.createEvents();
        //this.init();
    }
    

    createEvents(){

        this.events = new UTQueryEmitter();

        this.events.on("queryFinished", (data) =>{
            console.log("query finished");
            console.log(data);
            //process.exit();
        });  
    }

    sendMessage(type, ip, port){


        const messages = {
            "status": "\\status\\",
            "info": "\\info\\"
        };

        if(messages[type] === undefined){
            throw new Error(`${type} is not a valid type.`);
        }

        const now = Math.floor(Date.now() * 0.001);

        const current = {
            "ip": ip,
            "port": port + 1,
            "type": type,
            "created": now,
            "bCompleted": false,
            "players": {}
        };

        this.pending.push(current);

        this.server.send(`${messages[type]}xserverquery\\`, port + 1, ip);
    }

    async init(){

        try{

            console.log("a");
            await this.connect();
            console.log("b");

            const ip = "139.162.235.20";
            const ip2 = "173.230.132.25";
            const port = 7777;
            const ip3 = "195.98.73.166";
            const port3 = 6666;

            //this.sendMessage("status", ip, port);
            //this.sendMessage("status", ip3, port3);

           
        }catch(err){
            console.trace(err);
        }
    }

    getType(data, key){

        const test = `\\\\${key}\\\\(.*?)\\\\`;
        const reg = new RegExp(test,"i");

        const result = reg.exec(data);

        if(result !== null) return result[1];

        return null;
    }


    updatePending(data, players, ip, port, bFinal){

        let index = -1;

        for(let i = 0; i < this.pending.length; i++){

            const p = this.pending[i];

            if(p.ip === ip && port === p.port){

                index = i;
                break;
            }
        }

        if(index === -1){
            return;
            //throw new Error("Can't find matching data packet.");
        }

        this.pending[index] = {
            ...this.pending[index],
            ...data,
            "players": {...this.pending[index].players, ...players},
            "bCompleted": bFinal
        }

        if(bFinal){
            this.events.emit("queryFinished", this.pending[index]);
            this.pending.splice(index, 1);
            return;
        }
    }


    setValue(data, key, value){

        if(value === null) return;

        data[key] = value;
    }

    parsePlayerType(response, players, type){

        const rString = `\\\\${type}_(\\d+?)\\\\(.*?)\\\\`;
        const reg = new RegExp(rString, "ig");

        let result = 0;

        while(result !== null){

            result = reg.exec(response);

            if(result === null) return;

            const playerId = result[1];
            const value = result[2];

            if(players[playerId] === undefined){
                console.trace(`Player with id of ${playerId} is missing`);
                continue;
            }

            players[playerId][type] = value;
        }
    }

    createPlayers(response){

        const reg = /\\player_(\d+?)\\(.+?)\\/ig;

        const players = {};

        let pResult = 0;

        while(pResult !== null){

            pResult = reg.exec(response);

            if(pResult === null) break;

            players[pResult[1]] = {"name": pResult[2]};

        }

        const playerTypes = [
            "frags",
            "ping",
            "team",
            "face",
            "mesh", 
            "countryc", 
            "time",
            "deaths",
            "spree"
        ];


        for(let i = 0; i < playerTypes.length; i++){

            const type = playerTypes[i];
            this.parsePlayerType(response, players, type);
        }

        return players;

    }

    parseResponse(input, ip, port){
        
        const originalData = input.toString("latin1");

        console.log(originalData);
       // console.log("originalData");
        //console.log(originalData);

        const data = {
            "players": {}
        };


        this.setValue(data, "host", this.getType(originalData, "hostname"));
        this.setValue(data, "hostPort", this.getType(originalData, "hostport"));
        this.setValue(data, "mapTitle", this.getType(originalData, "maptitle"));
        this.setValue(data, "mapName", this.getType(originalData, "mapname"));
        this.setValue(data, "gametype", this.getType(originalData, "gametype"));
        this.setValue(data, "currentPlayers", this.getType(originalData, "numplayers"));
        this.setValue(data, "maxPlayers", this.getType(originalData, "maxplayers"));
        this.setValue(data, "minPlayers", this.getType(originalData, "minplayers"));
        this.setValue(data, "totalTeams", this.getType(originalData, "maxteams"));
        this.setValue(data, "timelimit", this.getType(originalData, "timelimit"));
        this.setValue(data, "goalTeamScore", this.getType(originalData, "goalteamscore"));
   
        const endReg = /\\final\\$/i;

        const players = this.createPlayers(originalData);
        //console.log(players);
        const bContainsFinal = endReg.test(originalData);

        this.updatePending(data, players, ip, port, bContainsFinal);
    }

    connect(){

        return new Promise((resolve, reject) =>{

            this.server = dgram.createSocket('udp4');

            this.server.on('error', (err) => {
                console.error(`server error:\n${err.stack}`);
                this.server.close();
                reject(err);
            });

            this.server.on('message', (msg, rinfo) => {
                //console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
                this.parseResponse(msg, rinfo.address, rinfo.port);
            });

            this.server.on('listening', () => {
                const address = this.server.address();
                console.log(`server listening ${address.address}:${address.port}`);
                resolve();
            });

            this.server.bind();
        });
    }
}


module.exports = UTServerQuery;