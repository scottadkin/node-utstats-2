const {imageServerPort, bIncludeImageServerPortInURLs, bUseSeperateImageServer} = require("../config.json");

class Functions{

    static firstCharLowerCase(input){

        let ending = input.substring(1);

        return `${input[0].toLowerCase()}${ending}`;
    }

    //default value is optional
    static setValueIfUndefined(input, defaultValue){

        if(defaultValue === undefined) defaultValue = 0;

        if(input !== undefined){
            if(input === null){
                return defaultValue;
            }
        }
        
        if(input === undefined) return defaultValue;

        return input;
    }


    static calculateKillEfficiency(kills, deaths){
        
        if(kills === 0) return 0;
        if(deaths === 0 && kills > 0) return 100;
        
        return (kills / (kills + deaths)) * 100;
    }
    

    static getPlayer = (players, id, bObject) =>{

        bObject = bObject ?? false;

        if(!bObject){

            for(let i = 0; i < players.length; i++){
        
                if(players[i].id === id){
                    return players[i];
                }
            }
        }else{

            if(players !== null){

                if(players[id] !== undefined){
                    return players[id];
                }
            }
        }
    
        return {"name": "not found", "country": "xx", "team": 0, "id": -1}
    }


    static getTeamColor(team){

        switch(team){
            case 0: {  return "team-red"; } ;
            case 1: {  return "team-blue"; } ;
            case 2: {  return "team-green"; } ;
            case 3: {  return "team-yellow"; };
            default: { return "team-none";} ;
        }
    }

    static getTeamName(team, bIgnoreTeam){

        let teamName = '';

        switch(team){

            case 0: { teamName = "Red"; } break;
            case 1: { teamName = "Blue"; } break;
            case 2: { teamName = "Green"; } break;
            case 3: { teamName = "Yellow"; } break;
            default: { teamName = "None"; } break;
        }


        if(bIgnoreTeam === undefined){

            if(teamName === "None") return "None";
            return `${teamName} Team`;
        }else{
            return teamName;
        }
    }


    static removeIps(data){

        if(data !== undefined){

            if(data !== null){

                for(let i = 0; i < data.length; i++){

                    if(data[i].ip !== undefined){
                        delete data[i].ip;
                    }
                }
            }
        }

        return data;
    }



    static getUniqueValues(data, key){

        const found = [];

        for(let i = 0; i < data.length; i++){

            if(found.indexOf(data[i][key]) === -1){
                found.push(data[i][key]);
            }
        }

        return found;
    }

    static getUniqueValuesMultipleKeys(data, keys){

        const found = [];

        for(let k = 0; k < keys.length; k++){

            const key = keys[k];

            console.log(`Current Key is ${key}`);

            for(let i = 0; i < data.length; i++){

                if(found.indexOf(data[i][key]) === -1){
                    found.push(data[i][key]);
                }
            }
        } 

        return found;
    }

    /**
     * Modify an array of objects by inserting a new key into each object with the ids matching value
     * @param {*} data Array of Objects to modify
     * @param {*} names Object/Array of id -> name pairs, e.g {"1": 'a name'}
     * @param {*} key What key holds the data for the id we need e.g a[key]
     * @param {*} newKey What key to create with the matching id's name e.g a[newKey]=value
     */
    static setIdNames(data, names, key, newKey){

        let d = 0;
        let currentId = 0;
    
        for(let i = 0; i < data.length; i++){
    
            d = data[i];
            currentId = d[key];
    
            if(names[currentId] !== undefined){
                d[newKey] = names[currentId];
            }else{
                d[newKey] = 'Not Found';
            }
        }
    }


    static removeMapGametypePrefix(name){

        const reg = /^.*?-(.+)$/i;

        const result = reg.exec(name);

        if(result === null){
            return name;
        }else{

            return result[1];
        }
    }


    static removeUnr(name){

        const reg = /^(.+?)\.unr$/i;

        const result = reg.exec(name);

        if(result !== null){
            return result[1];
        }

        return name;
    }

    static cleanMapName(name){

        name = this.removeUnr(name);
        name = this.removeMapGametypePrefix(name);

        name = name.replace(/[\[\]\'\`]/ig,"");

        return name;
    }

    static setSafeInt(value, defaultValue, minValue, maxValue){

        if(defaultValue === undefined) defaultValue = 1;

        if(value === undefined) return defaultValue;

        value = parseInt(value);

        if(value !== value){
            return defaultValue;
        }

        if(minValue !== undefined){

            if(value < minValue){
                return minValue;
            }
        }

        if(maxValue !== undefined){

            if(value > maxValue){
                return maxValue;
            }
        }

        return value;
    }


    /**
     * Only display Values that are not zero
     */

    static ignore0(input){

        if(input != 0){
            return input;
        }

        return "";
    }


    static MMSS(timestamp){

        let seconds = Math.floor(timestamp % 60);
        let minutes = Math.floor(timestamp / 60);
        let hours = Math.floor(minutes / 60);

        if(seconds < 0) seconds = 0;
        if(minutes < 0) minutes = 0;

        if(seconds < 10){
            seconds = `0${seconds}`;
        }

        if(minutes < 10){
            minutes = `0${minutes}`;
        }

        if(hours < 1){
            return `${minutes}:${seconds}`;
        }else{

            minutes = minutes % 60;
            if(minutes < 10) minutes = `0${minutes}`;
            
            return `${hours}:${minutes}:${seconds}`;
        }
    }


    static insertIfNotExists(array, value){


        for(let i = 0; i < array.length; i++){

            if(array[i] === value) return array;
        }

        array.push(value);
    }


    static cleanDamage(damage){

        if(damage < 1000) return damage;

        if(damage >= 1000 && damage < 1000000){
            return `${(damage / 1000).toFixed(2)}K`;
        }else if(damage >= 1000000 && damage < 1000000000){
            return `${(damage / 1000000).toFixed(2)}M`;
        }else if(damage >= 1000000000 && damage < 1000000000000){
            return `${(damage / 1000000000).toFixed(2)}B`;
        }else{
            return `${(damage / 1000000000000).toFixed(2)}T`;
        }

    }


    /**
     * 
     * @param {*} total how many arrays to create (Used for graphs)
     * @returns 
     */
    static createDateRange(total, defaultValue){

        const obj = [];

        for(let i = 0; i < total; i++){

            obj.push(defaultValue);
        }

        return obj;
    }


    static insertIfNotExists(data, value){

        if(data.indexOf(value) === -1) data.push(value);

    }


    static getOrdinal(value){

        const first = value % 10;
        const second = value % 100;

        if(second >= 10 && second < 20){
            return 'th';
        }

        if(first === 1){
            return 'st';
        }else if(first === 2){
            return 'nd';
        }else if(first === 3){
            return 'rd';
        }

        return 'th';
        
    }

    static getDayName = (day) =>{

        switch(day){
            case 0: {   return 'Sunday'; }
            case 1: {   return 'Monday'; }
            case 2: {   return 'Tuesday'; }
            case 3: {   return 'Wednesday'; }
            case 4: {   return 'Thursday'; }
            case 5: {   return 'Friday'; }
            case 6: {   return 'Saturday'; }
        }
    }
    
    
    static getMonthName = (month) =>{
    
        switch(month){
            case 0: { return 'Jan'; } 
            case 1: { return 'Feb'; } 
            case 2: { return 'Mar'; } 
            case 3: { return 'Apr'; } 
            case 4: { return 'May'; } 
            case 5: { return 'June'; } 
            case 6: { return 'July'; } 
            case 7: { return 'Aug'; } 
            case 8: { return 'Sep'; } 
            case 9: { return 'Oct'; } 
            case 10: { return 'Nov'; } 
            case 11: { return 'Dec'; } 
        }
    }
    
    static convertTimestamp = (timestamp, noDayName, noTime) =>{

        noDayName = (noDayName !== undefined) ? noDayName : false;
        noTime = (noTime !== undefined) ? noTime : false;
    
        const now = new Date();
        now.setTime(timestamp * 1000);
    
        const year = now.getFullYear();
        const month = now.getMonth();
        const dayName = now.getDay();
        const day = now.getDate();
        const hour = now.getHours();
        let minute = now.getMinutes();
        
        if(minute < 10) minute = `0${minute}`;
    
        let dayNameString = "";
  
        if(!noDayName){
            dayNameString = `${this.getDayName(dayName)} `;
        }
        
        let timeString = "";
    
        if(!noTime){
            timeString = ` ${hour}:${minute}`;
        }
    
        return `${dayNameString}${day}${this.getOrdinal(day)} ${this.getMonthName(month)} ${year}${timeString}`;
    
    }

    static DDMMYY(timestamp, displaySeconds){

        const date = new Date(timestamp * 1000);


        let minutes = date.getMinutes();
        let hours = date.getHours();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        if(minutes < 10) minutes = `0${minutes}`;
        if(hours < 10) hours = `0${hours}`;
        if(day < 10) day = `0${day}`;
        if(month < 10) month = `0${month}`;

        if(displaySeconds === undefined){

            return `${day}/${month}/${year}`;

        }else{

            return `${day}/${month}/${year} ${hours}:${minutes}`;
        }

    }


    static setCookie(key, value){

        if(process.browser){

            const maxAge = ((60 * 60) * 24) * 365;
            const path = "/";

            document.cookie = `${key}=${value}; max-age=${maxAge}; path=${path}`;
        }
    }

    static stringToIntArray(string){

        const data = string.split(",");

        if(data.length === 0) return [];

        if(data.length === 1){

            if(data[0] === "") return [];
        }

        let d = 0;

        for(let i = 0; i < data.length; i++){

            data[i] = parseInt(data[i]);


        }

        return data;
    }


    static generateRandomChar(){

        const chars = `abcdefghijklmnopqrstuvwxyz0123456789!"$%^&*()_+-=:;@'~#[],.<>?/`;

        const r = Math.floor(Math.random() * (chars.length - 1));

        return chars[r];
    }

    static generateRandomString(length){

        let string = "";

        for(let i = 0; i < length; i++){

            string += this.generateRandomChar();
        }

        return string;
    }

    static removeExtension(input){

        const reg = /^(.+)\..+?$/i;

        const result = reg.exec(input);

        if(result !== null){

            return result[1];
        }

        return input;
    }


    static utDate(input){


        const year = input.slice(0,4);
        const month = input.slice(4,6);
        const day = input.slice(6,8);
        const hour = input.slice(8,10);
        const minute = input.slice(10,12);
        const seconds = input.slice(12,14);

        return Math.floor(new Date(year, month - 1, day, hour, minute, seconds) * 0.001);
    }

    static createMapOGLink(image){

        const imageReg = /^.+\/(.+)\.jpg$/i;
        const imageRegResult = imageReg.exec(image);
        let ogImage = "maps/default";

        if(imageRegResult !== null){
            ogImage = `maps/${imageRegResult[1]}`;
        }

        return ogImage;
    }

    static apostrophe(name){

        name = name.toLowerCase();
        if(name[name.length - 1] === 's'){
            return '\'';
        }

        return '\'s';
    }


    static timeString(input){

        let seconds = Math.floor(input % 60);
        let minutes = Math.floor((input / 60) % 60);
        let hours = Math.floor(input / (60 * 60));

        const secondLabel = (seconds === 1) ? 'Second' : 'Seconds';
        const minuteLabel = (minutes === 1) ? 'Minute': 'Minutes';
        const hourLabel = (hours === 1) ? 'Hour' : 'Hours';

        const secondString = (seconds > 0) ? `${seconds} ${secondLabel}` : null;
        const minuteString = (minutes > 0) ? `${minutes} ${minuteLabel}` : null;
        const hourString = (hours > 0) ? `${hours} ${hourLabel}` : null;

        let string = "";
        let parts = 0;


        if(hourString !== null){
            string += hourString;
            parts++;
        }

        if(minuteString !== null){
            if(string !== "") string += ", "
            string += minuteString;
            parts++;
        }

        if(secondString !== null && parts < 2){
            if(string !== "") string += ", "
            string += secondString;
        }
      
        return string;
    }

    static toHours(seconds){

        if(seconds === 0) return 0;

        return (seconds / 3600).toFixed(2);
    }

    static reduceGraphDataPoints(inputData, max){

        if(inputData.length === 0) return [];

        const totalDataPoints = inputData[0].data.length;

        if(totalDataPoints <= max) return inputData;

        const increment = totalDataPoints / max;

        const outputData = [];

        for(let i = 0; i < inputData.length; i++){

            const current = inputData[i];

            outputData.push({"name": current.name, "data": [], "lastValue": current.lastValue});
        }

        for(let i = 0; i < max; i++){

            for(let x = 0; x < inputData.length; x++){

                outputData[x].data.push(inputData[x].data[Math.ceil(increment * i)]);

                if(i === max - 1){
                    outputData[x].data.push(inputData[x].lastValue);
                }
            }
        }

        return outputData;
    }

    static getImageHostAndPort(host){

        if(!bUseSeperateImageServer){
            //console.log(host);
            //return host;

            return "";
        }

        const hostReg = /^(.+):(\d+)$/im;
        const hostResult = hostReg.exec(host);

        let port = "";
        
        if(hostResult !== null){
            port = `${imageServerPort}`;
            host = hostResult[1];
        }else{

            if(bIncludeImageServerPortInURLs){
                return `${host}:${imageServerPort}`;
            }else{
                return `${imageServerPort}`;
            }
        }

        if(bIncludeImageServerPortInURLs){
            return `http://${host}:${port}`;
        }else{
            return `http://${host}`;
        }
       
    }

    static getImageUrl(host, url){


        console.log(`${host}${url}`);

        return `${host}${url}`;
        
    }

    static capTime(input){

        const ms = Math.floor((input%1) * 100).toString().padStart(2, '0');

        let seconds = Math.floor(input % 60);
        let minutes = Math.floor(input / 60);
        let hours = Math.floor(input / (60 * 60));

        if(seconds < 10){
            seconds = `0${seconds}`;
        }

        if(minutes === 0){
            minutes = "0";
        }
      

        if(hours === 0){
            hours = "";
        }else{
            hours = `${hours}:`
        }

       // console.log(ms);

       // console.log(`${hours}${minutes}:${seconds}.${ms}`);

        return `${hours}${minutes}:${seconds}.${ms}`;
    }


    static getTeamColorName(id){

        if(id === 0) return "Red";
        if(id === 1) return "Blue";
        if(id === 2) return "Green";
        if(id === 3) return "Yellow";
    }


    static plural(value, word){

        if(value == "") return "";

        if(value === 1) return word;

        return `${word}s`;
    }


    static toPlaytime(seconds){

        if(seconds === 0) return "None";

        const rSeconds = Math.floor(seconds % 60);
        const secondString = Functions.plural(rSeconds, "Second");

        const totalMintues = Math.floor(seconds / 60);

        const rMinutes = Math.floor(totalMintues % 60);
        const minuteString = Functions.plural(rMinutes, "Minute");
            
        const hours = Math.floor(totalMintues / 60);
        const hoursString = Functions.plural(hours, "Hour");

       // const minutes = Math.floor(seconds / 60) % 60;

        if(hours > 0){

            if(rMinutes > 0){
                return `${hours} ${hoursString}, ${rMinutes} ${minuteString}`;
            }else{

                if(rSeconds > 0){
                    return `${hours} ${hoursString}, ${rSeconds} ${secondString}`;
                }
            }

            return `${hours} ${hoursString}`;
            
        }else{

            if(rMinutes > 0){

                if(rSeconds > 0){
                    return `${rMinutes} ${minuteString}, ${rSeconds} ${secondString}`;
                }

                return `${rMinutes} ${minuteString}`;

            }else{

                return `${rSeconds} ${secondString}`;
            }
        }

        return ":thinking:";
        //return `${hours}horus (${rMinutes}), ${rSeconds} secs`
    }

}

module.exports = Functions;