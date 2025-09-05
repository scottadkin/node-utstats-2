import { simpleQuery, insertReturnInsertId, mysqlEscape } from "./api/database.js";

(async () =>{

    const test = await simpleQuery("SELECT COUNT(*) as spawns FROM nstats_map_spawns WHERE map=33333");
    console.log(test);
    console.log(await simpleQuery("INSERT INTO nstats_dummy VALUES(?,?)", [222, "DELETE FROM nstats_dummy"]));
    process.exit();

})();