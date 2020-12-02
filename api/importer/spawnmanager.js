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

    playerSpawned(playerId, loc){

        this.data.push(
            {
                "id": parseInt(playerId),
                "location": {
                    "x": parseFloat(loc[0]),
                    "y": parseFloat(loc[1]),
                    "z": parseFloat(loc[2])
                }
            }
        );
    }
}


module.exports = SpawnManager;