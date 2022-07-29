const SFTPImporter = require("./api/importer/sftpimporter");

const test = new SFTPImporter("localhost", 22, "sftpuser", "password");