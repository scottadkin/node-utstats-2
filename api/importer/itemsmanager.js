const Message = require("../message");
const Items = require("../items");

class ItemsManager{

    constructor(lines, playerManager, killsManager, totalTeams){

        this.lines = lines;
        this.playerManager = playerManager;
        this.killsManager = killsManager;
        this.totalTeams = totalTeams;

        this.items = new Items();

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

        this.parseData();
    }

    parseActivate(line, bDeactivate){

        const reg = (bDeactivate) ? this.deactiveReg : this.activeReg;

        const result = reg.exec(line);
        const timestamp = parseFloat(result[1]);
        const item = result[2];
        const playerId = parseInt(result[3]);

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


    parseData(){

        const reg = /^(\d+?\.\d+?)\titem_get\t(.+?)\t(.+)$/i;
 
        let currentItems = 0;

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

                    currentItems = currentPlayerPickup.items;

                    if(currentItems[result[2]] === undefined){
                        currentItems[result[2]] = 1;
                    }else{
                        currentItems[result[2]]++;
                    }

                    this.matchData.set(parseInt(result[3]), {"items": currentItems});
                    
                }else{

                    currentItems = {"items": {}};
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
            }
        }
    }

    async updateTotals(date){

        try{

            for(const [key, value] of this.pickupCount){

                await this.items.updateTotals(key, value, date);
            }

        }catch(err){
            new Message(`ItemManager.updateTotals ${err}`,'error');
        }
    }

    getSavedItemId(name){

        for(let i = 0; i < this.itemIds.length; i++){

            const d = this.itemIds[i];

            if(d.name === name){
                return d.id;
            }
        }

        return null;
    }

    async insertMatchData(matchId, date){

        try{

            if(this.itemNames.length > 0){
                this.itemIds = await this.items.getIdsByNames(this.itemNames);
            }

            for(const [key, value] of this.matchData){

                const currentPlayer = this.playerManager.getPlayerById(key);

                if(currentPlayer !== null){
                    
                    for(const [subKey, subValue] of Object.entries(value.items)){

                        const currentId = this.getSavedItemId(subKey);

                        if(currentId !== null){
      
                            await this.items.insertPlayerMatchItem(matchId, currentPlayer.masterId, currentId, subValue);         
                            await this.items.updatePlayerTotal(currentPlayer.masterId, currentId, subValue, date);                     

                        }else{

                            new Message(`Failed to insert player item pickup, ${subKey} does not have an id.`,'warning');
                        }
                    }

                }else{
                    new Message(`Failed to insert player item pickup, currentPlayer is null.`,'warning');
                }
        
            }

        }catch(err){
            console.trace(err);
            new Message(`ItemManager.insertMatchData ${err}`,'error');
        }
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

    setPlayerPickupTimes(matchEnd){


        for(let i = 0; i < this.events.length; i++){

            const e = this.events[i];

            if(e.bDeactivate) continue;

            let endTimestamp = this.getDeactiveDataTimestamp(e.timestamp, e.item, e.player);

            if(endTimestamp === null){

                const nextDeath = this.killsManager.getPlayerNextDeath(e.player, e.timestamp);

                if(nextDeath === null){
                    endTimestamp = matchEnd;
                }else{
                    endTimestamp = nextDeath.timestamp;
                }
            }

            const totalKills = this.killsManager.getKillsBetween(e.timestamp, endTimestamp, e.player, true);

            const currentCarryTime = endTimestamp - e.timestamp;
            e.carryTime = currentCarryTime;
            e.totalKills = totalKills;

            const playerTeam = this.playerManager.getPlayerTeamAt(e.player, e.timestamp);

            this.updateAmpTeamKills(playerTeam, totalKills);
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


    async setPlayerMatchPickups(matchId){

        try{


            for(const [playerId, value] of Object.entries(this.playerPickups)){

                const ampStats = this.getPlayerItemStats(parseInt(playerId), "amp");
                const invisStats = this.getPlayerItemStats(parseInt(playerId), "invis");
               
                value.ampStats = ampStats;
                value.invisStats = invisStats;

                await this.items.setPlayerMatchPickups(matchId, parseInt(playerId), value);
                await this.items.updatePlayerBasicPickupData(parseInt(playerId), value);
               
            }

        }catch(err){
            new Message(`ItemsManager.setPlayerMatchPickups() ${err}`,"error");
        }
    }


    async setMatchAmpStats(matchId){

        await this.items.updateMatchAmpKills(matchId, this.ampKills);
    }
    
}

module.exports = ItemsManager;