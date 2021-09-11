const Message = require("../message");
const Items = require("../items");

class ItemsManager{

    constructor(lines){

        this.lines = lines;

        this.items = new Items();

        this.data = [];

        this.activeData = [];
        this.deactiveData = [];

        this.pickupCount = new Map();

        this.matchData = new Map();

        this.itemNames = [];

        this.parseData();
    }

    parseData(){

        const reg = /^(\d+?\.\d+?)\titem_get\t(.+?)\t(.+)$/i;

        const activeReg = /^(\d+?\.\d+?)\titem_activate\t(.+?)\t(.+)$/i
        const deactiveReg = /^(\d+?\.\d+?)\titem_deactivate\t(.+?)\t(.+)$/i

        let result = '';

        let currentPickup = 0;
        let currentPlayerPickup = 0;
        let currentItems = 0;

        for(let i = 0; i < this.lines.length; i++){

            result = reg.exec(this.lines[i]);

            if(result !== null){

                if(this.itemNames.indexOf(result[2]) === -1){
                    this.itemNames.push(result[2]);
                }

                currentPickup = this.pickupCount.get(result[2]);

                if(currentPickup === undefined){
                    this.pickupCount.set(result[2], 1);
                }else{
                    this.pickupCount.set(result[2], currentPickup + 1);
                }

                //match pickups

                currentPlayerPickup = this.matchData.get(parseInt(result[3]));

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

            }else if(activeReg.test(this.lines[i])){

                result = activeReg.exec(this.lines[i]);

                this.activeData.push(
                    {
                        "timestamp": parseFloat(result[1]),
                        "item": result[2],
                        "player": parseInt(result[3])
                    }
                );

            }else if(deactiveReg.test(this.lines[i])){

                result = deactiveReg.exec(this.lines[i]);

                this.deactiveData.push(
                    {
                        "timestamp": parseFloat(result[1]),
                        "item": result[2],
                        "player": parseInt(result[3])
                    }
                );
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

        let d = 0;

        for(let i = 0; i < this.itemIds.length; i++){

            d = this.itemIds[i];

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

            let currentId = 0;
            let currentPlayer = 0;

            for(const [key, value] of this.matchData){

                currentPlayer = this.playerManager.getOriginalConnectionById(key);

                if(currentPlayer !== null){
                    
                    for(const [subKey, subValue] of Object.entries(value.items)){

                        currentId = this.getSavedItemId(subKey);

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

        let d = 0;

        let currentName = "";

        this.playerPickups = {};

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            currentName = d.item.replace(/\s/ig, "").toLowerCase();

            if(currentName === "damageamplifier"){
             

                this.updateUsedPickups(d.player, "amp");

            }else if(currentName === "shieldbelt"){
                
                this.updateUsedPickups(d.player, "belt");

            }else if(currentName === "invisibility"){
                this.updateUsedPickups(d.player, "invis");

            }else if(currentName === "bodyarmor"){

                this.updateUsedPickups(d.player, "armor");

            }else if(currentName === "antigravboots"){

                this.updateUsedPickups(d.player, "boots");

            }else if(currentName === "thighpads"){
                this.updateUsedPickups(d.player, "pads");

            }else if(currentName === "superhealthpack"){
                this.updateUsedPickups(d.player, "super");
            }
        }

    }


    getDeactiveDataTimestamp(activeTimestamp, item, player){

        let d = 0;

        for(let i = 0; i < this.deactiveData.length; i++){

            d = this.deactiveData[i];

            if(d.timestamp >= activeTimestamp){

                if(d.item === item && d.player === player){
                    return d.timestamp;
                }
            }
        }

        return null;
    }

    setPlayerPickupTimes(matchEnd){

        //if there is no deactivate data use the match end time


        let a = 0;

        let endTimestamp = 0;
        let currentDiff = 0;

        for(let i = 0; i < this.activeData.length; i++){

            a = this.activeData[i];

            endTimestamp = this.getDeactiveDataTimestamp(a.timestamp, a.item, a.player);
            //console.log(this.getDeactiveDataTimestamp(a.timestamp, a.item, a.player));

            if(endTimestamp === null){
                endTimestamp = matchEnd;
            }

            currentDiff = endTimestamp - a.timestamp;

            a.carryTime = currentDiff;

        }

    }

    getPlayerTotalItemCarryTime(player, item){

        let total = 0;

        let a = 0;

        let fixedItemName = "";

        

        for(let i = 0; i < this.activeData.length; i++){

            a = this.activeData[i];

            fixedItemName = a.item.replace(/\s/ig,"").toLowerCase();

            //console.log(fixedItemName);

            if(a.player === player){

                if(fixedItemName === "damageamplifier" && item === "amp"){
                    total += a.carryTime;
                }else if(fixedItemName === "invisibility" && item === "invis"){
                    total += a.carryTime;
                }
            }
        }

        return total;
    }

    async setPlayerMatchPickups(matchId){

        try{

            let player = 0;

            let currentAmpTime = 0;
            let currentInvisTime = 0;


            for(const [key, value] of Object.entries(this.playerPickups)){

                //console.log(key, value);

                currentAmpTime = this.getPlayerTotalItemCarryTime(parseInt(key), "amp");;
                currentInvisTime = this.getPlayerTotalItemCarryTime(parseInt(key), "invis");;

               
                value.ampTime = currentAmpTime;
                value.invisTime = currentInvisTime;

                player = this.playerManager.getOriginalConnectionById(parseInt(key));

                if(player !== null){
                    await this.items.setPlayerMatchPickups(matchId, player.masterId, value);
                    await this.items.updatePlayerBasicPickupData(player.masterId, value);
                }else{
                    new Message("ItemsManager.setPlayerMatchPickups() player is null","warning");
                }
            }

        }catch(err){
            new Message(`ItemsManager.setPlayerMatchPickups() ${err}`,"error");
        }
    }
    
}

module.exports = ItemsManager;