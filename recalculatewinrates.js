const WinRate = require("./api/winrate");
const Players = require("./api/players");
const Message = require("./api/message");

(async () =>{

    const start = performance.now();
    const p = new Players();

    const playerIds = await p.getAllPlayerIds();


    const w = new WinRate();

    for(let i = 0; i < playerIds.length; i++){

        const id = playerIds[i];
        await w.recalculatePlayerHistoryAfterMerge(id);
        new Message(`Completed recalculating winrates for playerId = ${id} (${i + 1}/${playerIds.length} completed)`, "pass");
    }

    const end = performance.now();

    const diff = end - start;
    new Message(`Finished in ${diff * 0.001} seconds.`,"progress");
    process.exit();
    //recalculatePlayerHistoryAfterMerge
})();

