const Players = require("./api/players");


(async () =>{

    const p = new Players();

    //need to do telefrags separately
    await p.recalculateAllPlayerMapGametypeRecords();

    process.exit();
})();