const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');

class Voices{

    constructor(){

        this.voices = [];

    }

    exists(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_voices FROM nstats_voices WHERE name=?";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result[0].total_voices > 0){
                    resolve(true);
                }

                resolve(false);
            });
        });
    }

    create(name, date, uses){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_voices VALUES(NULL,?,?,?,?)";

            mysql.query(query, [name, date, date, uses], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    updateStats(name, date, uses){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_voices SET 
            uses=uses+?,
            first = IF(first < ?, first, ?),
            last = IF(last > ?, last, ?)
            
            WHERE name=?`;

            mysql.query(query, [uses, date, date, date, date, name], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async updateStatsBulk(data, matchDate){
       
        try{

            for(const voice in data){

                if(await this.exists(voice)){

                    new Message(`Updating voice stats for "${voice}".`,'note');
                    await this.updateStats(voice, matchDate, data[voice]);

                }else{
                    new Message(`There is no data for the voice "${voice}", creating now.`,'note');
                    await this.create(voice, matchDate, data[voice]);
                }
            }    

        }catch(err){
            new Message(`updateStats ${err}`,'error');
        }
    }


    updatePlayerVoice(playerId, voiceId){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_player_totals SET voice=? WHERE id=?";

            mysql.query(query, [voiceId, playerId], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    getAllIds(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nstats_voices";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    const data = {};

                    for(let i = 0; i < result.length; i++){
                        data[result[i].name] = result[i].id;

                    }

                    this.voices = data;

                    resolve();
                }

                resolve();
            });
        });
    }


    getIdFromVoices(name){


        for(const voice in this.voices){

            if(voice === name){
                return this.voices[voice];
            }
        }

        return null;
    }


    async setPlayerVoices(players){

        try{

            let currentId = 0;

            let p = 0;

            for(let i = 0; i < players.length; i++){

                p = players[i];

                currentId = this.getIdFromVoices(p.voice);

                if(currentId !== null){

                    await this.updatePlayerVoice(p.masterId, currentId);
                    p.voiceId = currentId;
                }else{
                    p.voiceId = 0;
                    new Message(`Failed to update player voice`,'warning');
                }

            }
        }catch(err){
            new Message(`setPlayerVoices ${err}`,'error');
        }
    }


    reduceTotals(id, amount){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nstats_voices SET uses=uses-? WHERE id=?";

            mysql.query(query, [amount, id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }
}

module.exports = Voices;