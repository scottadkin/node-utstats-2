const mysql = require("./api/database");
const Maps = require("./api/maps");
const Assault = require("./api/assault");
const CTF = require("./api/ctf");
const Domination = require("./api/domination");
const Combogib = require("./api/combogib");
const Weapons = require("./api/weapons");
const Players = require("./api/players");
const PowerUps = require("./api/powerups");
const Telefrags = require("./api/telefrags");
const WinRate = require("./api/winrate");

(async () =>{

    const a = new Assault();
    const m = new Maps();
    const c = new CTF();
    const d = new Domination();

    const cg = new Combogib();
    const w = new Weapons();
    const p = new Players();
    const pow = new PowerUps();
    const t = new Telefrags();
    const win = new WinRate();



    await m.merge(1, 69, a, c, d, cg, w, p, pow, t, win);

    //const cg = new Combogib();

    //await cg.fixDuplicatePlayerTotals();


    

    //await w.changeMapId(1,69);

    process.exit();

})();