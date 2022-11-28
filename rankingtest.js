const Rankings = require("./api/rankings");


(async () =>{

    const r = new Rankings();

    await r.init();


    await r.updatePlayerCurrent(538, 16, 1111, 2312, 33);

    process.exit();

})();

