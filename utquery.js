const UTServerQuery = require("./lib/utserverquery");
const mysql = require("./api/database");
const Servers = require("./api/servers");


const pingAllServers = async (servers, utQuery) =>{

    const list = await servers.getQueryList();

    for(let i = 0; i < list.length; i++){

        const {ip, port} = list[i];

        utQuery.sendMessage("status", ip, port);
    }
}


(async () =>{

    const utQuery = new UTServerQuery();
    await utQuery.init();

    const servers = new Servers();

    utQuery.events.on("queryFinished", async (result) =>{

        await servers.setQueryStats(
            result.ip, 
            result.hostPort, 
            result.host ?? "Not Found", 
            result.gametype ?? "Not Found", 
            result.mapName ?? "Not Found",
            result.currentPlayers ?? 0,
            result.maxPlayers ?? 0
        );


        const mapName = (result.mapName !== undefined) ? `${result.mapName}` : "not found";

        await servers.insertQueryHistory(
            result.ip, 
            result.hostPort, 
            Math.floor(Date.now() * 0.001), 
            result.currentPlayers ?? 0, 
            mapName
        );

        const serverId = await servers.getQueryId(result.ip, result.hostPort);
        await servers.insertQueryPlayers(serverId, result.players);
    });


    //setInterval(async () =>{

        await pingAllServers(servers, utQuery);
   // }, 2500);

    setInterval(async () =>{

        await pingAllServers(servers, utQuery);
    }, 60000);

    
})();