const mysql = require('./api/database');
const CTF = require('./api/ctf');
const Message = require('./api/message');
const Maps = require('./api/maps');
const Matches = require('./api/matches');


function getMatchIds(mapFastestCaps){

    const matchIds = [];

    for(const [mapId, data] of Object.entries(mapFastestCaps)){

        if(data.solo !== null){

            if(matchIds.indexOf(data.solo.match_id) === -1){
                matchIds.push(data.solo.match_id);
            }
        }

        if(data.assisted !== null){

            if(matchIds.indexOf(data.assisted.match_id) === -1){
                matchIds.push(data.assisted.match_id);
            }
        }
    }

    return matchIds;
}

(async () =>{

    const ctfManager = new CTF();

    new Message("Attempting to delete all previous map cap records.", "note");
    await ctfManager.clearRecords();
    new Message("Deleted all previous map cap records.", "pass");

    const mapIds = await ctfManager.getAllMapsWithCaps(); 
    new Message(`Found a total of ${mapIds.length} maps with ctf caps.`, "pass");

    const mapFastestCaps = await ctfManager.getMapsCapRecords(mapIds);

    const matchManager = new Matches();

    const matchIds = getMatchIds(mapFastestCaps);
    const matchDates = await matchManager.getDates(matchIds);

    let soloUpdated = 0;
    let assistedUpdated = 0;

    for(const [mapId, data] of Object.entries(mapFastestCaps)){

        if(data.solo !== null){

            const soloMatchDate = (matchDates[data.solo.match_id] !== undefined) ? matchDates[data.solo.match_id] : -1;

            await ctfManager.insertCapRecord(data.solo.match_id, mapId, 0, data.solo, soloMatchDate);

            new Message(`Inserted Solo Cap Record for map id ${mapId}`,"pass");
            soloUpdated++;

        }else{
            new Message(`There is no Solo Cap Record for map id ${mapId}`,"note");
        }

        if(data.assisted !== null){

            const assistedMatchDate = (matchDates[data.assisted.match_id] !== undefined) ? matchDates[data.assisted.match_id] : -1;

            await ctfManager.insertCapRecord(data.assisted.match_id, mapId, 1, data.assisted, assistedMatchDate);
            new Message(`Inserted Assisted Cap Record for map id ${mapId}`,"pass");
            assistedUpdated++;

        }else{
            new Message(`There is no Assisted Cap Record for map id ${mapId}`,"note");
        }
    }

    new Message(`Updated ${soloUpdated} solo cap records.`, "note");
    new Message(`Updated ${assistedUpdated} assisted cap records.`, "note");
    new Message(`Process complete.`, "note");

    process.exit(0);

})();

