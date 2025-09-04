import { updateReturnAffectedRows } from "./api/database.js";
import Message from "./api/message.js";

(async () =>{

    new Message("Deleting user accounts.","note");
    const query = "DELETE FROM nstats_users";

    const deleted = await updateReturnAffectedRows(query);

    new Message(`Deleted ${deleted} user accounts`,"pass");

    new Message("Process Complete.","note");
    process.exit(0);
})();