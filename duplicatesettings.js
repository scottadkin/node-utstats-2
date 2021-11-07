const mysql = require("./api/database");
const SiteSettings = require("./api/sitesettings");

const settings = new SiteSettings();

(async () =>{

    await settings.deleteDuplicates();
})();