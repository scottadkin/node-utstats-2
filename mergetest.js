const PlayerMerger = require("./api/playerMerger");

(async () =>{

    //const p = new PlayerMerger(2,1337);
    const p = new PlayerMerger(2,1);

    //await p.merge();

    await p.recalcCTFTotals();

    process.exit();
})();