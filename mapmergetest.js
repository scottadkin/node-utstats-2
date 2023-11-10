const mysql = require("./api/database");
const Maps = require("./api/maps");
const Assault = require("./api/assault");
const CTF = require("./api/ctf");
const Domination = require("./api/domination");

(async () =>{

    const a = new Assault();
    const m = new Maps();
    const c = new CTF();
    const d = new Domination();


    //await a.mergeDuplicateObjectives(21);


    await m.merge(1, 2, a, c, d);

    process.exit();

})();