import Servers from "../servers.js";
import Message from "../message.js";
import { toMysqlDate } from "../generic.mjs";

export default class ServerInfo{

    constructor(data, matchTimings){
           
        this.matchTimings = matchTimings;
        this.data = data;

        this.ip = null;

        this.parseData();
        this.convertDate();
        
        this.servers = new Servers();
   
    }

    async updateServer(/*geoip*/){

        /*const geo = geoip.lookup(this.ip);

        let country = 'xx';

        if(geo !== null){
            country = geo.country.toLowerCase();
        }*/
        
        await this.servers.updateServer(
            //this.ip, 
            //this.server_port, 
            this.server_servername, 
            this.date, 
            this.matchTimings.length,
            ""
        );

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


    setIp(ipType, value){

        if(ipType === "true_server_ip"){
            this.ip = value;
            return;
        }

        if(this.ip === null) this.ip = value;
    }

    parseData(){

        const reg = /^\d+\.\d+\tinfo\t(.+?)\t(.*?)$/i;

        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];

            const result = reg.exec(d);
            if(result === null) continue;

            const type = result[1].toLowerCase();
            const value = result[2];

            if(type === "server_ip" || type === "true_server_ip"){

                this.setIp(type, value);
                continue;
            }

            this[type] = value;                
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

            this.date = toMysqlDate(date.getTime());
 
        }  
    }


    async getServerId(){

        try{

            //const id = await this.servers.getServerId(this.ip, this.server_port);

            const id = await this.servers.getServerIdByName(this.server_servername);
      
            if(id !== null){
                return id;
            }else{
                new Message('Server with that name does not exist in the database. ','warning');
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

    async setLastIds(serverId, matchId, mapId){

        await this.servers.setLastIds(serverId, matchId, mapId);
    }
}