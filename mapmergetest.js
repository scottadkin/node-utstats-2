const mysql = require("./api/database");
const Maps = require("./api/maps");
const Assault = require("./api/assault");
const CTF = require("./api/ctf");
const Domination = require("./api/domination");
const Combogib = require("./api/combogib");

(async () =>{

    const a = new Assault();
    const m = new Maps();
    const c = new CTF();
    const d = new Domination();

    const cg = new Combogib();


    //await a.mergeDuplicateObjectives(21);


    await m.merge(26, 28, a, c, d, cg);

    process.exit();

})();