class ServerInfo{

    constructor(data){
           
        this.data = data;
        this.defaultReg = /^(\d+\.\d+)\tinfo\t(.+)$/i;

        this.types = [
            {"label": "log_standard", "var": "logStandard"},
            {"label": "log_version", "var": "logVersion"},
            {"label": "game_name", "var": "gameName"},
            {"label": "game_version", "var": "gameVersion"},
            {"label": "absolute_time", "var": "time"},
            {"label": "utglenabled", "var": "utgl"},
            {"label": "true_server_ip", "var": "trueIp"},
            {"label": "server_ip", "var": "ip"},
            {"label": "server_servername", "var": "name"},
            {"label": "server_adminname", "var": "admin"},
            {"label": "server_region", "var": "region"},
            {"label": "server_motdline1", "var": "motd1"},
            {"label": "server_motdline2", "var": "motd2"},
            {"label": "server_motdline3", "var": "motd3"},
            {"label": "server_motdline4", "var": "motd4"},
            {"label": "server_port", "var": "port"}
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

        const reg = /^\d+\.\d+\tinfo\t(.+?)\t(.+?)$/i;

        let currentResult = 0;
        let currentType = 0;
        let d = 0;


        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(reg.test(d)){

                currentResult = reg.exec(d);

                currentType = this.getMatchingType(currentResult[1]);

                if(currentType !== null){
                    this[currentType] = currentResult[2];
                }
                
            }
        }
    }



}

module.exports = ServerInfo;