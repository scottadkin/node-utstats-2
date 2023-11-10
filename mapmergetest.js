const mysql = require("./api/database");
const Maps = require("./api/maps");
const Assault = require("./api/assault");
const CTF = require("./api/ctf");

(async () =>{

    const a = new Assault();
    const m = new Maps();
    const c = new CTF();


    //await a.mergeDuplicateObjectives(21);


    await m.merge(18, 19, a, c);

    process.exit();

})();