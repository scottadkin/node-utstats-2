const Message = require('../message');
const Promise = require('promise');
const Maps = require('../maps');
const Spawns = require('../spawns');

class SpawnManager{

    constructor(){


        this.spawnPoints = [];

        this.data = [];

    }

    addSpawnPoint(name, string, id){

        const reg = /^(\d+?)\t(.+?),(.+?),(.+?)$/i;

        const result = reg.exec(string);

        this.spawnPoints.push(
            {
                "id": (id === undefined) ? this.spawnPoints.length : parseInt(id),
                "name": name,
                "team": parseInt(result[1]),
                "position": {
                    "x": parseFloat(result[2]),
                    "y": parseFloat(result[3]),
                    "z": parseFloat(result[4])
                },
                "totalSpawns": 0
            }
        );

    }

    playerSpawnedLegacy(timestamp, playerId, loc){


        const spawnId = this.getMatchingSpawn(parseFloat(loc[0]), parseFloat(loc[1]), parseFloat(loc[2]));

        if(spawnId !== null){

            this.updateSpawnCount(spawnId);
        }

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

    playerSpawned(timestamp, playerId, spawnId){

        let s = 0;

        timestamp = parseFloat(timestamp);
        playerId = parseInt(playerId);
        spawnId = parseInt(spawnId);

        for(let i = 0; i < this.spawnPoints.length; i++){

            s = this.spawnPoints[i];

            if(s.id === spawnId){

                this.data.push(
                    {
                        "timestamp": timestamp,
                        "player": parseInt(playerId),
                        "position": {
                            "x": s.position.x,
                            "y": s.position.y,
                            "z": s.position.z
                        },
                        "spawnId": s.id
                    }
                );

                this.updateSpawnCount(s.id);

                return;

            }
        }
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

    updateSpawnCount(id){

        let s = 0;

        for(let i = 0; i < this.spawnPoints.length; i++){

            s = this.spawnPoints[i];

            if(s.id === id){
                s.totalSpawns++;
                return;
            }
        }
    }

    setMapId(id){

        this.mapId = id;
    }

    async updateMapStats(){

        try{

            this.spawns = new Spawns();

            if(this.mapId !== undefined){

                const currentSpawns = await this.spawns.getTotalMapSpawns(this.mapId);

                let s = 0;

                if(currentSpawns === 0){

                    new Message(`There is no spawn data from map with id ${this.mapId}, creating now.`,'note');

                    for(let i = 0; i < this.spawnPoints.length; i++){

                        s = this.spawnPoints[i];

                        await this.spawns.insert(s.name, this.mapId, s.position.x, s.position.y, s.position.z, s.totalSpawns);
                    }

                }else{

                    let result = 0;

                    for(let i = 0; i < this.spawnPoints.length; i++){

                        s = this.spawnPoints[i];

                        result = await this.spawns.update(s.name, this.mapId, s.totalSpawns);

                        if(result.affectedRows === 0){
                            new Message(`Failed to update spawn stat(deleted?), creating new data point.`,'warning');
                            await this.spawns.insert(s.name, this.mapId, s.position.x, s.position.y, s.position.z, s.totalSpawns);
                        }
                    }
                }
                

            }else{
                new Message(`MapId is undefined`,'warning');
            }

        }catch(fart){

            new Message(`There was a problem update map spawn stats ${fart}`,'warning');
        }
    }
}


module.exports = SpawnManager;