const Message = require('../message');
const Promise = require('promise');

class SpawnManager{

    constructor(){


        this.spawnPoints = [];

        this.data = [];

        new Message(`Change the mutator to log spawn points ids, instead of their x,y,z coordinates to save file space`,'error');
        new Message(`Check for both old mutator spawn logging and the replacement for backward compatibility`,'error');

    }

    addSpawnPoint(name, string){

        const reg = /^(\d+?)\t(.+?),(.+?),(.+?)$/i;

        const result = reg.exec(string);

        this.spawnPoints.push(
            {
                "id": this.spawnPoints.length,
                "name": name,
                "team": parseInt(result[1]),
                "position": {
                    "x": parseFloat(result[2]),
                    "y": parseFloat(result[3]),
                    "z": parseFloat(result[4])
                }
            }
        );

    }

    playerSpawnedLegacy(timestamp, playerId, loc){


        const spawnId = this.getMatchingSpawn(parseFloat(loc[0]), parseFloat(loc[1]), parseFloat(loc[2]));

        this.data.push(
            {
                "timestamp": timestamp,
                "player": parseInt(playerId),
                "position": {
                    "x": parseFloat(loc[0]),
                    "y": parseFloat(loc[1]),
                    "z": parseFloat(loc[2])
                },
                "spawnId": spawnId
            }
        );
    }

    getMatchingSpawn(x,y,z){

        let s = 0;

        for(let i = 0; i < this.spawnPoints.length; i++){

            s = this.spawnPoints[i];

            if(s.position.x === x && s.position.y === y && s.position.z === z){
                return s.id;
            }
        }

        return null;
    }

    getPlayerSpawns(id){

        const data = [];

        for(let i = 0; i < this.data.length; i++){

            if(this.data[i].player === id){
                data.push(this.data[i]);
            }
        }

        return data;
    }
}


module.exports = SpawnManager;