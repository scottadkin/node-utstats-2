import { simpleQuery } from './database.js';
import Message from './message.js';

export default class Voices{

    constructor(){

        this.voices = [];

    }

    async exists(name){

        const query = "SELECT COUNT(*) as total_voices FROM nstats_voices WHERE name=?";

        const result = await simpleQuery(query, [name]);

        return result[0].total_voices > 0;
    }

    async create(name, date, uses){

        const query = "INSERT INTO nstats_voices VALUES(NULL,?,?,?,?)";

        return await simpleQuery(query, [name, date, date, uses]);
    }


    async updateStats(name, date, uses){

        const query = `UPDATE nstats_voices SET 
            uses=uses+?,
            first = IF(first < ?, first, ?),
            last = IF(last > ?, last, ?)
            
            WHERE name=?`;

        const vars = [uses, date, date, date, date, name];
        
        return await simpleQuery(query, vars);
    }

    async updateStatsBulk(data, matchDate){
       
        try{

            for(const voice in data){

                if(await this.exists(voice)){

                    //new Message(`Updating voice stats for "${voice}".`,'note');
                    await this.updateStats(voice, matchDate, data[voice]);

                }else{
                    //new Message(`There is no data for the voice "${voice}", creating now.`,'note');
                    await this.create(voice, matchDate, data[voice]);
                }
            }    

        }catch(err){
            new Message(`updateStats ${err}`,'error');
        }
    }


    async updatePlayerVoice(playerId, voiceId){

        const query = "UPDATE nstats_player_totals SET voice=? WHERE id=?";
        return await simpleQuery(query, [voiceId, playerId]);
    }

    async getAllIds(){

        const query = "SELECT id,name FROM nstats_voices";
        const result = await simpleQuery(query);

        this.voices = {};

        for(let i = 0; i < result.length; i++){
            this.voices[result[i].name] = result[i].id;
        }
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

            for(let i = 0; i < players.length; i++){

                const p = players[i];

                const currentId = this.getIdFromVoices(p.voice);

                if(currentId !== null){

                    await this.updatePlayerVoice(p.masterId, currentId);
                    p.voiceId = currentId;
                }else{
                    p.voiceId = 0;
                    //new Message(`Failed to update player voice`,'warning');
                }

            }
        }catch(err){
            new Message(`setPlayerVoices ${err}`,'error');
        }
    }


    async reduceTotals(id, amount){

        const query = "UPDATE nstats_voices SET uses=uses-? WHERE id=?";
        const vars = [amount, id];

        await simpleQuery(query, vars);
   
    }


    async deletePlayer(matches){

        try{

            const uses = {};

            for(let i = 0; i < matches.length; i++){

                const m = matches[i];

                if(uses[m.voice] === undefined){
                    uses[m.voice] = 0;
                }

                uses[m.voice]++;
            }


            for(const [key, value] of Object.entries(uses)){

                await this.reduceTotals(parseInt(key), value);
            }

        }catch(err){
            console.trace(err);
        }
    }

    async reduceViaPlayerMatchData(data){

        try{

            const uses = {};

            for(let i = 0; i < data.length; i++){

                const d = data[i];

                if(uses[d.voice] === undefined){
                    uses[d.voice] = 0;
                }

                uses[d.voice]++;
            }

            for(const [voice, count] of Object.entries(uses)){

                await this.reduceTotals(parseInt(voice), count);
            }

        }catch(err){
            console.trace(err);
        }
    }
}


async function calculateTotalsFromMatchTable(voiceIds){

    if(voiceIds.length === 0) return {};

    const query = `SELECT voice,COUNT(*) as total_uses,MIN(match_date) as first_match,MAX(match_Date) as last_match FROM nstats_player_matches WHERE face IN (?) GROUP BY voice`;

    const result = await simpleQuery(query, [voiceIds]);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        data[r.voice] = r;
    }

    return data;
}

async function deleteVoice(id){

    const query = `DELETE FROM nstats_voices WHERE id=?`;

    return await simpleQuery(query, [id]);
}

export async function recalculateTotals(voiceIds){

    if(voiceIds.length === 0) return;

    const totals = await calculateTotalsFromMatchTable(voiceIds);

    const query = `UPDATE nstats_voices SET uses=?,first=?,last=? WHERE id=?`;


    for(let i = 0; i < voiceIds.length; i++){

        const id = voiceIds[i];

        if(totals[id] === undefined){

            await deleteVoice(id);

        }else{

            const t = totals[id];
            console.log(t);
            await simpleQuery(query, [t.total_uses, t.first_match, t.last_match, t.voice]);
        }
    }
}