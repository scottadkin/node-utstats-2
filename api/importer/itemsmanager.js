const Message = require("../message");
const Items = require("../items");

class ItemsManager{

    constructor(lines){

        this.lines = lines;

        this.items = new Items();

        this.data = [];

        this.pickupCount = new Map();

        this.matchData = new Map();

        this.itemNames = [];

        this.parseData();
    }

    parseData(){

        const reg = /^(\d+?\.\d+?)\titem_get\t(.+?)\t(.+)$/i;
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
                    new Message(`Failed to insert player item pickup, player with id ${currentPlayer.masterId} does not exist.`,'warning');
                }
        
            }

        }catch(err){
            console.trace(err);
            new Message(`ItemManager.insertMatchData ${err}`,'error');
        }
    }
    
}

module.exports = ItemsManager;