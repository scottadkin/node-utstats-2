import { simpleQuery, bulkInsert } from './database.js';
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

        const query = "INSERT INTO nstats_voices VALUES(NULL,?)";

        return await simpleQuery(query, [name]);
    }



    async updateStatsBulk(data, matchDate){
       
    }


    async updatePlayerVoice(playerId, voiceId){

        const query = "UPDATE nstats_player SET voice=? WHERE id=?";
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

        console.log(`set before isnertplayermatch data`);
        return;

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
    }
}

async function bulkInsertNewVoices(voices){

    if(voices.length === 0) return {};

    const query = `INSERT INTO nstats_voices (name) VALUES ?`;

    const insertVars = [];

    for(let i = 0; i < voices.length; i++){

        insertVars.push([voices[i]])
    }

    await bulkInsert(query, insertVars);
    return await getIds(voices);
}

export async function getIds(names){

    if(names.length === 0) return {};

    const query = `SELECT id,name FROM nstats_voices WHERE name IN (?)`;

    const result = await simpleQuery(query, [names]);

    const missing = [...names];
    const found = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        found[r.name] = r.id;

        const index = missing.indexOf(r.name);

        if(index !== -1) missing.splice(index, 1);

    }

    return {...found, ...await bulkInsertNewVoices(missing)};
}


async function calculateTotalsFromMatchTable(voiceIds){

    if(voiceIds.length === 0) return {};

    const query = `SELECT voice,COUNT(*) as total_uses,MIN(match_date) as first_match,MAX(match_Date) as last_match FROM nstats_player_matches WHERE voice IN (?) GROUP BY voice`;

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


async function deleteVoicesTotals(ids){

    if(ids.length === 0) return;

    const query = `DELETE FROM nstats_voices_totals WHERE voice_id IN (?)`;

    return await simpleQuery(query, [ids]);
}



export async function recalculateTotals(voiceIds){


    if(voiceIds.length === 0) return;

    await deleteVoicesTotals(voiceIds);

    const totals = await calculateTotalsFromMatchTable(voiceIds);

    const insertVars = [];

    const query = `INSERT INTO nstats_voices_totals (voice_id,first,last,uses) VALUES ?`;

    for(const t of Object.values(totals)){

        insertVars.push([
            t.voice, t.first_match, t.last_match, t.total_uses
        ]);
    }

    await bulkInsert(query, insertVars);
}