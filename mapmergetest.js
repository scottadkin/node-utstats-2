const mysql = require("./api/database");
const Maps = require("./api/maps");
const Assault = require("./api/assault");

(async () =>{

    const a = new Assault();
    const m = new Maps();


    await a.mergeDuplicateObjectives(21);

    process.exit();

})();