import { simpleQuery } from "./api/database.js";
import CTF from "./api/ctf.js";
import Message from "./api/message.js";

async function getAllPlayerIds(){

    const query = `SELECT DISTINCT player_id FROM nstats_player_ctf_match`;

    const result = await simpleQuery(query);

    return result.map((r) =>{
        return r.player_id;
    });
}

(async () =>{


    const playerIds = await getAllPlayerIds();

    const c = new CTF();

    for(let i = 0; i < playerIds.length; i++){

        const id = playerIds[i];

        await c.recalculatePlayerTotals(id, id);
    }


    
    process.exit();
})();