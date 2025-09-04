import { simpleQuery, insertReturnInsertId } from "./api/database.js";

(async () =>{

    const test = await simpleQuery("SELECT COUNT(*) as spawns FROM nstats_map_spawns WHERE map=33333");
    console.log(test);
    process.exit();

})();