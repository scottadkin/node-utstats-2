import mysql from "../../../api/database";

export async function getLogsFolderSettings(){

    const query = `SELECT * FROM nstats_logs_folder`;

    const result = await mysql.simpleQuery(query);

    if(result.length > 0) return result[0];

    return null;
}

export async function getAllFTPSettings(){

    const query = `SELECT * FROM nstats_ftp ORDER BY name ASC`;

    const result = await mysql.simpleQuery(query);

    const logsFolder = await getLogsFolderSettings();

    return {"ftp": result, "logsFolder": logsFolder}

}