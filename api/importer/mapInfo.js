class MapInfo{

    constructor(data){

        this.data = data;

        this.types = [
            {"label": "name", "var": "name"},
            {"label": "title", "var": "title"},
            {"label": "author", "var": "author"},
            {"label": "idealplayercount", "var": "idealPlayerCount"},
            {"label": "levelentertext", "var": "levelEnterText"}
        ];

        this.parseData();
    }

    getMatchingType(type){

        type = type.toLowerCase();

        for(let i = 0; i < this.types.length; i++){

            if(this.types[i].label === type){
                return this.types[i].var;
            }
        }

        return null;
    }

    parseData(){

        const reg = /^\d+\.\d+?\tmap\t(.+?)\t(.*)$/i;

        let currentResult = 0;
        let currentType = 0;

        for(let i = 0; i < this.data.length; i++){

            currentResult = reg.exec(this.data[i]);

            if(currentResult !== null){

                currentType = this.getMatchingType(currentResult[1]);

                if(currentType !== null){
                    this[currentType] = currentResult[2]
                }
            }
        }
    }

}

module.exports = MapInfo;