const PlayerMerger = require("./api/playerMerger");
const mysql = require("./api/database");

(async () =>{

    //const p = new PlayerMerger(2,1337);
    const p = new PlayerMerger(null,73333,"ZZZZZ");

    await p.mergeHWID();
   

    /*const query = `SHOW COLUMNS FROM nstats_player_totals`;
    const result = await mysql.simpleQuery(query);

    console.log(result);


    console.log(result.map((r) =>{
        return r.Field;
    }));

    return;*/

    //await p.merge();
    //await p.recalCTFTotals();

    process.exit();
})();