
const backupManager = require("./api/backup");

(async () =>{

    const bm = new backupManager();

    //await bm.emptyAllTables();

    await bm.restore();

    process.exit();
})();