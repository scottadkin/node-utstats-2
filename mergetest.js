const PlayerMerger = require("./api/playerMerger");

(async () =>{

    const p = new PlayerMerger(2,1337);

    await p.merge();

    process.exit();
})();