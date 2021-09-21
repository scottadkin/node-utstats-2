const mysql = require('./api/database');
const Message = require('./api/message');

(async () =>{

    new Message("Deleting user accounts.","note");
    const query = "DELETE FROM nstats_users";

    const deleted = await mysql.updateReturnAffectedRows(query);

    new Message(`Deleted ${deleted} user accounts`,"pass");

    new Message("Process Complete.","note");
    process.exit(0);
})();