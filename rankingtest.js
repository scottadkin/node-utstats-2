const Rankings = require("./api/rankings");


(async () =>{

    const r = new Rankings();

    await r.init();


    await r.updatePlayerRankings(538, 16, 175);

    process.exit();

})();

