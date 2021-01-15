const Message = require("../message");
const Items = require("../items");

class ItemsManager{

    constructor(lines){

        this.lines = lines;

        this.items = new Items();

        this.data = [];

        this.pickupCount = new Map();

        this.parseData();
    }

    parseData(){

        const reg = /^(\d+?\.\d+?)\titem_get\t(.+?)\t(.+)$/i;
        let result = '';

        let currentPickup = 0;

        for(let i = 0; i < this.lines.length; i++){

            result = reg.exec(this.lines[i]);

            if(result !== null){

                currentPickup = this.pickupCount.get(result[2]);

                if(currentPickup === undefined){
                    this.pickupCount.set(result[2], 1);
                }else{
                    this.pickupCount.set(result[2], currentPickup + 1);
                }
                
                this.data.push({
                    "timestamp": parseFloat(result[1]),
                    "item": result[2],
                    "player": parseInt(result[3])
                });
            }
        }

        console.log(this.data);


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
}

module.exports = ItemsManager;