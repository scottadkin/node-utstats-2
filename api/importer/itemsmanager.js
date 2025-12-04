import Message from "../message.js";
import Items, { bulkUpdatePlayerTotals } from "../items.js";
import PowerUpManager from "./powerupmanager.js";
import { getIdsByNames as getItemsByNames, getIds, updateTotals } from "../items.js";

export default class ItemsManager{

    constructor(lines, playerManager, killsManager, totalTeams){

        this.lines = lines;
        this.playerManager = playerManager;
        this.killsManager = killsManager;
        this.totalTeams = totalTeams;

        this.items = new Items();
        this.powerUpManager = new PowerUpManager(playerManager, killsManager);

        this.powerUpNames = new Set();

        this.data = [];

        this.events = [];

        this.activeReg = /^(\d+?\.\d+?)\titem_activate\t(.+?)\t(.+)$/i
        this.deactiveReg = /^(\d+?\.\d+?)\titem_deactivate\t(.+?)\t(.+)$/i

        this.pickupCount = new Map();

        this.matchData = new Map();

        this.itemNames = [];

        this.ampKills = {
            "red": 0,
            "blue": 0,
            "green": 0,
            "yellow": 0,
            "total": 0
        };


        //kill on players that had the amp powerup
        this.ampPlayerKills = [];
        this.ampUserKills = {};
        this.ampUserSuicides = {};

        this.locations = [];
        this.parseData();
    }

    parseActivate(line, bDeactivate){

        const reg = (bDeactivate) ? this.deactiveReg : this.activeReg;

        const result = reg.exec(line);
        const timestamp = parseFloat(result[1]);
        const item = result[2];
        const playerId = parseInt(result[3]);

        this.powerUpManager.addName(item);

        const player = this.playerManager.getPlayerById(playerId);

        if(player === null){
            new Message(`ItemsManager.parseActive() player is null.`,"warning");
            return;
        }

        this.events.push(
            {
                "timestamp": timestamp,
                "item": item,
                "player": player.masterId,
                "bDeactivate": bDeactivate 
            }
        );
    }


    parseLocation(line){

        const reg = /^(\d+?\.\d+?)\tnstats\t(.+?)_location\t(.+?)\t(.+?)\t(.+?),(.+?),(.+?)$/i;

        const result = reg.exec(line);

        if(result === null) return;

        this.locations.push({
            "type": result[2],
            "className": result[3],
            "name": result[4],
            "location": {
                "x": parseFloat(result[5]),
                "y": parseFloat(result[6]),
                "z": parseFloat(result[7])
            }
        });    
    }

    parseData(){

        const reg = /^(\d+?\.\d+?)\titem_get\t(.+?)\t(.+)$/i;

        for(let i = 0; i < this.lines.length; i++){

            const line = this.lines[i];

            const result = reg.exec(line);

            if(result !== null){

                if(this.itemNames.indexOf(result[2]) === -1){
                    this.itemNames.push(result[2]);
                }

                const currentPickup = this.pickupCount.get(result[2]);

                if(currentPickup === undefined){
                    this.pickupCount.set(result[2], 1);
                }else{
                    this.pickupCount.set(result[2], currentPickup + 1);
                }

                //match pickups

                const currentPlayerPickup = this.matchData.get(parseInt(result[3]));

                if(currentPlayerPickup !== undefined){

                    const currentItems = currentPlayerPickup.items;

                    if(currentItems[result[2]] === undefined){
                        currentItems[result[2]] = 1;
                    }else{
                        currentItems[result[2]]++;
                    }

                    this.matchData.set(parseInt(result[3]), {"items": currentItems});
                    
                }else{

                    const currentItems = {"items": {}};
                    currentItems.items[result[2]] = 1;

                    this.matchData.set(parseInt(result[3]), currentItems);

                }
                
                this.data.push({
                    "timestamp": parseFloat(result[1]),
                    "item": result[2],
                    "player": parseInt(result[3])
                });

            }else if(this.activeReg.test(line)){

                this.parseActivate(line, false);

            }else if(this.deactiveReg.test(line)){

                this.parseActivate(line, true);
                
            }else{

                this.parseLocation(line);
            }
        }
    }

    async setItemIds(){

        this.itemIds = await getIds(this.itemNames);
    }

    getSavedItemId(name){

        if(this.itemIds[name] !== undefined) return this.itemIds[name];

        return null;

    }

    async insertMatchData(matchId, date){

        const matchPlayerInsertVars = [];

        const playerIds = new Set();
        const itemIds = new Set();

        for(const [key, value] of this.matchData){

            const currentPlayer = this.playerManager.getPlayerById(key);

            if(currentPlayer !== null){
                
                for(const [subKey, subValue] of Object.entries(value.items)){

                    const currentId = this.getSavedItemId(subKey);
                    playerIds.add(currentPlayer.masterId);  

                    if(currentId !== null){

                        itemIds.add(currentId);
    
                        matchPlayerInsertVars.push([matchId, date, currentPlayer.masterId, currentId, subValue]);      
                        // await this.items.updatePlayerTotal(currentPlayer.masterId, currentId, subValue, date); 
                        
                    }else{

                        new Message(`Failed to insert player item pickup, ${subKey} does not have an id.`,'warning');
                    }
                }

            }else{
                new Message(`Failed to insert player item pickup, currentPlayer is null.`,'warning');
            }
        }
 
        await this.items.insertAllPlayerMatchItems(matchPlayerInsertVars);
        await bulkUpdatePlayerTotals([...playerIds], [...itemIds]);

    }

    updateUsedPickups(player, type){

        if(this.playerPickups[player] === undefined){

            this.playerPickups[player] = {};
        }

        if(this.playerPickups[player][type] === undefined){
            this.playerPickups[player][type] = 1;
        }else{
            this.playerPickups[player][type]++;
        }
    }

    setPlayerPickups(){

        this.playerPickups = {};

        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];

            const currentName = d.item.replace(/\s/ig, "").toLowerCase();

            const player = this.playerManager.getPlayerById(d.player);

            if(player === null){
                new Message(`ItemsManager.setPlayerPickups() player is null`, "warning");
                continue;
            }

            const playerId = player.masterId;

            if(currentName === "damageamplifier"){
             
                this.updateUsedPickups(playerId, "amp");

            }else if(currentName === "shieldbelt"){
                
                this.updateUsedPickups(playerId, "belt");

            }else if(currentName === "invisibility"){
                this.updateUsedPickups(playerId, "invis");

            }else if(currentName === "bodyarmor"){

                this.updateUsedPickups(playerId, "armor");

            }else if(currentName === "antigravboots"){

                this.updateUsedPickups(playerId, "boots");

            }else if(currentName === "thighpads"){
                this.updateUsedPickups(playerId, "pads");

            }else if(currentName === "superhealthpack"){
                this.updateUsedPickups(playerId, "super");
            }
        }
    }

    getDeactiveDataTimestamp(activateTimestamp, item, player){

        for(let i = 0; i < this.events.length; i++){

            const e = this.events[i];

            if(e.timestamp < activateTimestamp) continue;
            if(!e.bDeactivate) continue;

            if(e.player !== player) continue;
            if(e.item === item) return e.timestamp;
            
        }

        return null;
    }

    updateAmpDeaths(death){

        const type = death.type;

        if(type !== "kill" && type !== "suicide") return;

        const data = (type === "kill") ? this.ampUserKills : this.ampUserSuicides;

        let killerId = death.killerId;

        if(type === "kill"){
            this.ampPlayerKills.push({
                "killerId": death.killerId,
                "timestamp": death.timestamp
            });
        }
        
        if(data[killerId] === undefined){
            data[killerId] = 0;
        }

        data[killerId]++;
    }

    getItemEnd(startTimestamp, item, playerId){

        const closestDeativate = this.getDeactiveDataTimestamp(startTimestamp, item, playerId);

        const closestDeath = this.killsManager.getPlayerNextDeath(playerId, startTimestamp);

        if(closestDeativate === null && closestDeath === null){
            return null;
        }

        if(closestDeativate !== null && closestDeath !== null){

            if(closestDeativate < closestDeath.timestamp) return closestDeativate;
            return closestDeath;
        }

        if(closestDeath !== null && closestDeativate === null) return closestDeath;
        if(closestDeath === null && closestDeativate !== null) return closestDeativate;

    }

    setPlayerPickupTimes(matchEnd){


        for(let i = 0; i < this.events.length; i++){

            const e = this.events[i];

            const item = e.item.replace(/\s/ig, "").toLowerCase();

            if(e.bDeactivate) continue;

            const endInfo = this.getItemEnd(e.timestamp, e.item, e.player);

            let endTimestamp = matchEnd;

            if(endInfo !== null){

                if(item === "damageamplifier" && endInfo.timestamp !== undefined){
                    this.updateAmpDeaths(endInfo);
                }

                if(endInfo.timestamp !== undefined){

                    if(endInfo.type === "kill"){

                        e.endReason = 1;
                        e.killerId = endInfo.killerId;

                    }else if(endInfo.type === "suicide"){
                        e.endReason = 2;
                    }
                    endTimestamp = endInfo.timestamp;
                }else{
                    e.endReason = 0;
                    endTimestamp = endInfo;
                }
            }else{

                e.endReason = -1;
            }

            e.endTimestamp = endTimestamp;




            const totalKills = this.killsManager.getKillsBetween(e.timestamp, endTimestamp, e.player, true);

            const currentCarryTime = endTimestamp - e.timestamp;
            e.carryTime = currentCarryTime;
            e.totalKills = totalKills;

            const playerTeam = this.playerManager.getPlayerTeamAt(e.player, e.timestamp);

            if(item === "damageamplifier"){
                this.updateAmpTeamKills(playerTeam, totalKills);
            }
        }
    }

    updateAmpTeamKills(team, kills){

        this.ampKills.total += kills;

        if(team === -1 || this.totalTeams < 2) return;
            
        if(team === 0) this.ampKills.red += kills;
        if(team === 1) this.ampKills.blue += kills;
        if(team === 2) this.ampKills.green += kills;
        if(team === 3) this.ampKills.yellow += kills;
        
    }

    getPlayerItemStats(player, item){

        let totalTime = 0;
        let totalKills = 0;
        let bestKills = 0;

        for(let i = 0; i < this.events.length; i++){

            const e = this.events[i];

            if(e.player !== player) continue;
            if(e.bDeactivate) continue;

            const fixedItemName = e.item.replace(/\s/ig,"").toLowerCase();

            if(fixedItemName === "damageamplifier" && item === "amp"){

                totalTime += e.carryTime;
                totalKills += e.totalKills;
                if(e.totalKills > bestKills) bestKills = e.totalKills;

            }else if(fixedItemName === "invisibility" && item === "invis"){

                totalTime += e.carryTime;
                totalKills += e.totalKills;
                if(e.totalKills > bestKills) bestKills = e.totalKills;

            }      
        }

        return {"totalTime": totalTime, "totalKills": totalKills, "bestKills": bestKills};
    }

    //kills on a udamage player
    getPlayerAmpPlayerKillStats(playerId){

        let totalKills = 0;
        let bestKills = 0;
        let currentLife = 0;

        let previousTimestamp = 0;

        for(let i = 0; i < this.ampPlayerKills.length; i++){

            const {killerId, timestamp} = this.ampPlayerKills[i];

            if(killerId !== playerId) continue;

            const totalDeaths = this.killsManager.getDeathsBetween(previousTimestamp, timestamp, killerId);

            if(totalDeaths > 0) currentLife = 0;

            totalKills++;
            currentLife++;

            if(currentLife > bestKills) bestKills = currentLife;
            previousTimestamp = timestamp;
        }


        return {"totalKills": totalKills, "bestKills": bestKills}

    }

    getPlayerAmpSuicides(playerId){

        if(this.ampUserSuicides[playerId] !== undefined){
            return this.ampUserSuicides[playerId];
        }

        return 0;
    }


    async setPlayerMatchPickups(matchId){

        try{

            for(const [pId, value] of Object.entries(this.playerPickups)){

                const playerId = parseInt(pId);

                const ampStats = this.getPlayerItemStats(playerId, "amp");
                const invisStats = this.getPlayerItemStats(playerId, "invis");
               
                value.ampStats = ampStats;
                value.invisStats = invisStats;

                value.ampStats.ampPlayerKills = this.getPlayerAmpPlayerKillStats(playerId);
                value.ampStats.suicides = this.getPlayerAmpSuicides(playerId);


                await this.items.setPlayerMatchPickups(matchId, playerId, value);
                await this.items.updatePlayerBasicPickupData(playerId, value);
               
            }

        }catch(err){
            new Message(`ItemsManager.setPlayerMatchPickups() ${err}`,"error");
        }
    }


    async setMatchAmpStats(matchId){

        await this.items.updateMatchAmpKills(matchId, this.ampKills);     
    }


    async updatePowerUps(matchId, matchDate, totalTeams, mapId, gametypeId){

        this.powerUpManager.totalTeams = totalTeams;

        await this.powerUpManager.createIdsToNames();
        this.powerUpManager.addEvents(this.events);
        await this.powerUpManager.insertMatchData(matchId, matchDate, mapId, gametypeId);
    }

    async updateMapItems(mapId, matchId){

        const uniqueItems = {};

        for(let i = 0; i < this.locations.length; i++){

            const loc = this.locations[i];

            if(uniqueItems[loc.className] === undefined){
                uniqueItems[loc.className] = loc.type;
            }
        }


        await this.items.updateMapItems(uniqueItems, this.locations, mapId, matchId);
    }

    async updateTotals(){
        await updateTotals(Object.values(this.itemIds));
    }
}
