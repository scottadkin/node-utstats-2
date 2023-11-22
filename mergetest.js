const PlayerMerger = require("./api/playerMerger");

(async () =>{

    //const p = new PlayerMerger(2,1337);
    const p = new PlayerMerger(537,571);

    await p.merge();

    //await p.recalCTFTotals();

    process.exit();
})();