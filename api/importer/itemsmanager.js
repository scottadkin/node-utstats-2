class ItemsManager{

    constructor(lines){

        this.lines = lines;

        this.data = [];

        this.parseData();
    }

    parseData(){

        const reg = /^(\d+?\.\d+?)\titem_get\t(.+?)\t(.+)$/i;
        let result = '';

        for(let i = 0; i < this.lines.length; i++){

            result = reg.exec(this.lines[i]);

            if(result !== null){
                this.data.push({
                    "timestamp": parseFloat(result[1]),
                    "item": result[2],
                    "player": parseInt(result[3])
                });
            }
        }

    }
}

module.exports = ItemsManager;