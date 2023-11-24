const PlayerMerger = require("./api/playerMerger");
const mysql = require("./api/database");

(async () =>{

    //const p = new PlayerMerger(2,1337);
    const p = new PlayerMerger(217,1337);

    await p.merge();

    /*const query = `SHOW COLUMNS FROM nstats_player_matches`;
    const result = await mysql.simpleQuery(query);

    console.log(result);

    console.log(result.map((r) =>{
        return r.Field;
    }));*/

    //await p.recalCTFTotals();

    process.exit();
})();