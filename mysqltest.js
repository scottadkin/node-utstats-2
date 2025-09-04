import { simpleQuery, insertReturnInsertId } from "./api/database.js";

(async () =>{

    const test = await simpleQuery("SELECT * FROM nstats_dummy WHERE id=999999999");
    console.log(test);
    process.exit();

})();