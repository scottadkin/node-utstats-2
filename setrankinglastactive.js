const mysql = require("./api/database");
const Message = require("./api/message");
const Rankings = require("./api/rankings");

(async () =>{

    new Message(`Set all players last_active date script `,"note");

    const r = new Rankings();

    await r.setAllPlayerCurrentLastActive();

    new Message(`Finished`,"pass");
    process.exit();
})();