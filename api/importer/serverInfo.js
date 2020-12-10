

const Servers = require('../servers');
const Message = require('../message');

class ServerInfo{

    constructor(data, matchTimings){
           
        this.matchTimings = matchTimings;
        this.data = data;

        this.parseData();
        this.convertDate();
        
        this.servers = new Servers();
   
    }

    async updateServer(){

        try{
            await this.servers.updateServer(this.true_server_ip, this.server_port, this.server_servername, this.date, this.matchTimings.length);

        }catch(err){
            console.trace(err);
        }
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

        const reg = /^\d+\.\d+\tinfo\t(.+?)\t(.*?)$/i;

        let currentResult = 0;
        let d = 0;


        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(reg.test(d)){

                currentResult = reg.exec(d);
                this[currentResult[1].toLowerCase()] = currentResult[2];          
            }
        }
    }

    convertDate(){

        const reg = /^(\d{4})\.(\d{2})\.(\d{2})\.(\d{2})\.(\d{2})\.(\d{2})\.(\d+)\.(.+?)\.(.+)$/i;

        const result = reg.exec(this.absolute_time);

        if(result !== null){

            const year = parseInt(result[1]);
            const month = parseInt(result[2]) - 1;
            const day = parseInt(result[3]);
            const hours = parseInt(result[4]);
            const minutes = parseInt(result[5]);
            const seconds = parseInt(result[6]);

            const date = new Date(year, month, day, hours, minutes, seconds);

            this.date = date.getTime() * 0.001;
        }  
    }


    async getServerId(){

        try{

            const id = await this.servers.getServerId(this.true_server_ip, this.server_port);
      
            if(id !== null){
                return id;
            }else{
                new Message('Server with that ip port combo does not exist in the database. ','warning');
            }

            return null;

        }catch(err){
            console.trace(err);
        }      
    }

    getMotd(){

        let string = ``;

        for(let i = 1; i <= 4; i++){

            if(this[`server_motdline${i}`] !== undefined){

                string += `${this[`server_motdline${i}`]}\n`;

            }else{
                break;
            }
        }

        return string;
    }

}

module.exports = ServerInfo;