//const {imageServerPort, bIncludeImageServerPortInURLs, bUseSeperateImageServer} = require("../config.json");
import config from  "../config.json"  with {"type": "json"};

export function firstCharLowerCase(input){

    let ending = input.substring(1);

    return `${input[0].toLowerCase()}${ending}`;
}

//default value is optional
export function setValueIfUndefined(input, defaultValue){

    if(defaultValue === undefined) defaultValue = 0;

    if(input !== undefined){
        if(input === null){
            return defaultValue;
        }
    }
    
    if(input === undefined) return defaultValue;

    return input;
}


export function calculateKillEfficiency(kills, deaths){
    
    if(kills === 0) return 0;
    if(deaths === 0 && kills > 0) return 100;
    
    return (kills / (kills + deaths)) * 100;
}


export function getPlayer(players, id, bObject){

    id = parseInt(id);

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


export function getTeamColor(team){

    switch(team){
        case 0: {  return "team-red"; } ;
        case 1: {  return "team-blue"; } ;
        case 2: {  return "team-green"; } ;
        case 3: {  return "team-yellow"; };
        default: { return "team-none";} ;
    }
}

export function getTeamName(team, bIgnoreTeam){

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

export function getUniqueValuesMultipleKeys(data, keys){

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


export function removeMapGametypePrefix(name){

    const reg = /^.*?-(.+)$/i;

    const result = reg.exec(name);

    if(result === null){
        return name;
    }else{

        return result[1];
    }
}


export function removeUnr(name){

    const reg = /^(.+?)\.unr$/i;

    const result = reg.exec(name);

    if(result !== null){
        return result[1];
    }

    return name;
}


export function setSafeInt(value, defaultValue, minValue, maxValue){

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

export function ignore0(input){

    if(input != 0){
        return input;
    }

    return "";
}


export function MMSS(timestamp){

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


/*export function insertIfNotExists(array, value){


    for(let i = 0; i < array.length; i++){

        if(array[i] === value) return array;
    }

    array.push(value);
}*/


export function cleanDamage(damage){

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
export function createDateRange(total, defaultValue){

    const obj = [];

    for(let i = 0; i < total; i++){

        obj.push(defaultValue);
    }

    return obj;
}


export function insertIfNotExists(data, value){

    if(data.indexOf(value) === -1) data.push(value);

}


export function getOrdinal(value){

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

export function getDayName(day){

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


export function getMonthName(month, bFull) {

    if(bFull === undefined){
        bFull = false;
    }

    const short = {
        "0": "Jan",
        "1": "Feb",
        "2": "Mar",
        "3": "Apr",
        "4": "May",
        "5": "June",
        "6": "July",
        "7": "Aug",
        "8": "Sep",
        "9": "Oct",
        "10": "Nov",
        "11": "Dec"
    };


    const long = {
        "0": "January",
        "1": "February",
        "2": "March",
        "3": "April",
        "4": "May",
        "5": "June",
        "6": "July",
        "7": "August",
        "8": "September",
        "9": "October",
        "10": "November",
        "11": "December"
    };

    
    if(bFull) return long[month];
    return short[month];
}

export function convertTimestamp (timestamp, noDayName, noTime){

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
        dayNameString = `${getDayName(dayName)} `;
    }
    
    let timeString = "";

    if(!noTime){
        timeString = ` ${hour}:${minute}`;
    }

    return `${dayNameString}${day}${getOrdinal(day)} ${getMonthName(month)} ${year}${timeString}`;

}

export function DDMMYY(timestamp, displaySeconds){

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


export function setCookie(key, value){

    if(process.browser){

        const maxAge = ((60 * 60) * 24) * 365;
        const path = "/";

        document.cookie = `${key}=${value}; max-age=${maxAge}; path=${path}`;
    }
}

export function stringToIntArray(string){

    const data = string.split(",");

    if(data.length === 0) return [];

    if(data.length === 1){

        if(data[0] === "") return [];
    }

    for(let i = 0; i < data.length; i++){

        data[i] = parseInt(data[i]);


    }

    return data;
}


export function generateRandomChar(){

    const chars = `abcdefghijklmnopqrstuvwxyz0123456789!"$%^&*()_+-=:;@'~#[],.<>?/`;

    const r = Math.floor(Math.random() * (chars.length - 1));

    return chars[r];
}

export function generateRandomString(length){

    let string = "";

    for(let i = 0; i < length; i++){

        string += generateRandomChar();
    }

    return string;
}

export function removeExtension(input){

    const reg = /^(.+)\..+?$/i;

    const result = reg.exec(input);

    if(result !== null){

        return result[1];
    }

    return input;
}



export function createMapOGLink(image){

    const imageReg = /^.+\/(.+)\.jpg$/i;
    const imageRegResult = imageReg.exec(image);
    let ogImage = "maps/default";

    if(imageRegResult !== null){
        ogImage = `maps/${imageRegResult[1]}`;
    }

    return ogImage;
}

export function apostrophe(name){

    name = name.toLowerCase();
    
    if(name[name.length - 1] === "s"){
        return "'";
    }

    return "'s";
}


export function timeString(input){

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

export function toHours(seconds){

    if(seconds === 0) return 0;

    return (seconds / 3600).toFixed(2);
}

export function reduceGraphDataPoints(inputData, max){

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
                // outputData[x].data.push(inputData[x].lastValue);
            }
        }
    }

    return outputData;
}

export function getImageHostAndPort(host){

    if(!config.bUseSeperateImageServer){
        //console.log(host);
        //return host;

        return "";
    }

    const hostReg = /^(.+):(\d+)$/im;
    const hostResult = hostReg.exec(host);

    let port = "";
    
    if(hostResult !== null){
        port = `${config.imageServerPort}`;
        host = hostResult[1];
    }else{

        if(config.bIncludeImageServerPortInURLs){
            return `${host}:${imageServerPort}`;
        }else{
            return `${imageServerPort}`;
        }
    }

    if(config.bIncludeImageServerPortInURLs){
        return `http://${host}:${port}`;
    }else{
        return `http://${host}`;
    }
    
}

export function getImageUrl(host, url){


    console.log(`${host}${url}`);

    return `${host}${url}`;
    
}

export function capTime(input){

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


export function getTeamColorName(id){

    if(id === 0) return "Red";
    if(id === 1) return "Blue";
    if(id === 2) return "Green";
    if(id === 3) return "Yellow";
}


export function plural(value, word){

    if(value == "") return "";

    if(value === 1) return word;

    return `${word}s`;
}


export function toPlaytime(seconds, bIncludeMilliSeconds){

    if(seconds === 0) return "None";

    const milliSeconds = seconds % 1;

    if(bIncludeMilliSeconds === undefined) bIncludeMilliSeconds = false;

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

            if(rSeconds > 0){

                if(bIncludeMilliSeconds){
                    return `${rSeconds}.${Math.floor(milliSeconds * 100)} ${secondString}`;
                }

                return `${rSeconds} ${secondString}`;
            }

            return `${Math.floor(milliSeconds * 1000)} ms`;
        }
    }
}

export function bAnyCTFData(playerData){

    for(let i = 0; i < playerData.length; i++){

        const p = playerData[i];

        if(p.ctfData === undefined) return false;

        for(const [key, value] of Object.entries(p.ctfData)){
    
            if(key.startsWith("flag_")){
                if(value > 0) return true;
            }
        }
    }

    return false;
}


export function bAnyDomData(playerData){

    for(let i = 0; i < playerData.length; i++){

        if(playerData[i].dom_caps > 0) return true;
    }

    return false;
}

export function getSmartCTFReturnString(string){

    const reg = /^return_(.+)$/i;

    const result = reg.exec(string);

    if(result === null) return string;

    const remaining = result[1];

    if(remaining === "closesave"){
        return "Close Save";
    }else if(remaining === "mid"){
        return "Middle";
    }else if(remaining === "base"){
        return "Home Base";
    }else if(remaining === "enemybase"){
        return "Enemy Base";
    }

    return string;
}


export function scalePlaytime(playtime, bHardcore){

    if(bHardcore && playtime !== 0){
        return playtime / 1.1;      
    }

    return playtime;
}
