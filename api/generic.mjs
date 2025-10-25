export const DEFAULT_DATE = "1999-11-30";
export const DEFAULT_MIN_DATE = "9999-01-01";

export function fart(){
    return "Fart Noise";
}

export function getNameFromDropDownList(names, targetId){

    targetId = parseInt(targetId);
    
    for(let i = 0; i < names.length; i++){

        const n = names[i];

        if(n.value === targetId) return n.displayValue;
    }

    return "Not Found";
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
    let secondString = plural(rSeconds, "Second");

    const totalMintues = Math.floor(seconds / 60);

    const rMinutes = Math.floor(totalMintues % 60);
    const minuteString = plural(rMinutes, "Minute");
        
    const hours = Math.floor(totalMintues / 60);
    const hoursString = plural(hours, "Hour");

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

                    let ms = Math.floor(milliSeconds * 100);
                    if(ms < 10) ms = `0${ms}`;
             
                    return `${rSeconds}.${ms} Seconds`;
                }

                return `${rSeconds} ${secondString}`;
            }

            return `${Math.floor(milliSeconds * 1000)} ms`;
        }
    }
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


export function getMonthName(month, bFull){

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

export function convertTimestamp(timestamp, noDayName, noTime){

    noDayName = (noDayName !== undefined) ? noDayName : false;
    noTime = (noTime !== undefined) ? noTime : false;

    const now = new Date(timestamp);
    //now.setTime(timestamp * 1000);

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

export function getPlayer(players, id, bObject){

    id = parseInt(id);

    bObject = bObject ?? false;

    if(!bObject){

        for(let i = 0; i < players.length; i++){
    
            if(players[i].id === id || players[i].player_id === id){
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

/**
 * Use for match data since version 2.15
 * @param {*} players 
 * @param {*} targetId 
 * @returns 
 */
export function getPlayerFromMatchData(players, targetId, bFullData){

    targetId = parseInt(targetId);
    if(bFullData === undefined) bFullData = false;

    for(let i = 0; i < players.length; i++){

        const p = players[i];
        if(p.player_id !== targetId) continue;

        if(bFullData) return p;

        return {"name": p.name, "country": p.country, "id": p.player_id, "team": p.team}
    }

    return {"name": "Not Found", "country": "xx", "id": -1, "team": 255};
}


export function ignore0(input){

    if(input != 0){
        return input;
    }

    return "";
}

/**
 * 
 * @param {Object} data 
 * @param {Array} targetKeys Array of target key names
 * @param {Array} returnKeys Array of the new keys for the unique values, targetKeys[0] = returnKeys[0] ect.
 */
export function getUniqueValuesFromObject(data, targetKeys, returnKeys){
    
    if(targetKeys.length > returnKeys.length) throw new Error("targetKeys must be at least the same length of returnKeys");

    const obj = {};

    for(let i = 0; i < returnKeys.length; i++){

        if(obj[returnKeys[i]] !== undefined) continue;
        obj[returnKeys[i]] = new Set();
    }

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        for(let x = 0; x < targetKeys.length; x++){

            const currentKey = targetKeys[x];
            const targetKey = returnKeys[x];

            obj[targetKey].add(d[currentKey]);
        }
    }

    for(const [key, values] of Object.entries(obj)){

        obj[key] = [...values]; 
    }

    return obj;
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


export function firstCharToUpperCase(text){

    if(text.length === 0) return "";

    const char1 = text[0].toUpperCase();

    const otherChars = text.substring(1);

    return `${char1}${otherChars}`;
}


export function toTeamColor(teamId){

    teamId = parseInt(teamId);

    if(teamId === 0) return "Red";
    if(teamId === 1) return "Blue";
    if(teamId === 2) return "Green";
    if(teamId === 3) return "Yellow";

    return "None";
}

export function removeUnr(name){

    const reg = /^(.+?)\.unr$/i;

    const result = reg.exec(name);

    if(result !== null){
        return result[1];
    }

    return name;
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

export function cleanMapName(name){

    name = removeUnr(name);
    name = removeMapGametypePrefix(name);
    name = name.replace(/[\[\]\'\`]/ig,"");

    return name;
}

export function idNameObjToDropDownArray(obj, bSortByDisplayValue){

    if(bSortByDisplayValue === undefined) bSortByDisplayValue = false;

    const entries = [];

    for(const [key, value] of Object.entries(obj)){

        entries.push({
            "value": key,
            "displayValue": value
        });
    }

    if(bSortByDisplayValue){

        entries.sort((a, b) =>{

            a = a.displayValue;
            b = b.displayValue;

            if(a < b) return -1;
            if(a > b) return 1;
            return 0;
        });
    }
    return entries;
}

/**
 * Find a partially matching image by name
 * @param {*} imagesList list of image files
 * @param {*} targetName target file name
 */
export function getSimilarImage(imagesList, targetName){

    if(imagesList === undefined) throw new Error("You must supply an array of images as the second argument.");
    if(targetName === undefined) throw new Error("You have not specified a target name to find.");

    const cleanTargetName = targetName.toLowerCase().replaceAll(" ", "");

    for(let i = 0; i < imagesList.length; i++){

        const image = imagesList[i];
        const cleanImageName = image.toLowerCase().replaceAll(" ", "");

        const regResult = /^(.+)\..+?$/i.exec(cleanImageName);

        if(regResult === null) continue;

        if(cleanTargetName.includes(regResult[1])){
            return image;
        }
    }

    return null;
}


/**
 * 
 * @param {*} inputData 
 * @param {*} maxDataPoints 
 * @param {*} inputLabels 
 * @param {*} bIgnoreSingleDataPoints Return empty array if there is only one data point
 * @param {*} colors 
 * @returns 
 */
export function reduceGraphDataPoints(inputData, maxDataPoints, inputLabels, bIgnoreSingleDataPoints, colors){
    
    if(bIgnoreSingleDataPoints === undefined){
        bIgnoreSingleDataPoints = false;
    }

    const outputData = [];
    const outputLabels = [];

    let mostDataPoints = 0;

    for(let i = 0; i < inputData.length; i++){

        const d = inputData[i];

        const current = {
            "name": d.name,
           // "color": colors[i % colors.length] ?? "red",
            "values": []
        }

        if(colors !== undefined){
            current.color = colors[i % colors.length] ?? "red";
        }

        outputData.push(current);

        if(d.data.length > mostDataPoints) mostDataPoints = d.data.length;
    }

    if(maxDataPoints === 0) maxDataPoints = mostDataPoints;

    let increment = 1;

    //if(maxDataPoints !== 0){

        //if(mostDataPoints > maxDataPoints){

          //  if(mostDataPoints !== 0 && maxDataPoints !== 0){

                increment = maxDataPoints / mostDataPoints;

                if(increment === 0) increment = 1;
          //  }
       // }
    //}

   // console.log(`increment = ${increment}`);


    for(let i = 0; i < mostDataPoints; i += Math.ceil(increment)){

        outputLabels.push(inputLabels[i]);
    }

    let bUsedFinalData = false;

    for(let x = 0; x < inputData.length; x++){

        for(let i = 0; i < mostDataPoints; i += increment){

            outputData[x].values.push(inputData[x].data[i]);
            if(i === mostDataPoints - 1) bUsedFinalData = true;
        }
    }

    //set all final data points here if not been set already
    if(!bUsedFinalData){

        
        outputLabels.push(inputLabels[inputLabels.length - 1]);

        for(let x = 0; x < inputData.length; x++){

            const lastIndex = mostDataPoints - 1;

            outputData[x].values.push(inputData[x].data[lastIndex]);      
        }
    }

    if(bIgnoreSingleDataPoints){

        for(let i = 0; i < outputData.length; i++){

            if(outputData[i].values.length === 1){
                outputData[i].values = [];
            }
        }
    }
    

    return {
        "data":  outputData, "labels": outputLabels};
}

export function scalePlaytime(playtime, bHardcore){

    playtime = parseFloat(playtime);
    if(bHardcore && playtime !== 0){
        return playtime / 1.1;      
    }

    return playtime;
}

export function getTeamName(team, bIgnoreTeam){

    team = parseInt(team);
    if(bIgnoreTeam === undefined) bIgnoreTeam = false;

    let teamName = '';

    switch(team){

        case 0: { teamName = "Red"; } break;
        case 1: { teamName = "Blue"; } break;
        case 2: { teamName = "Green"; } break;
        case 3: { teamName = "Yellow"; } break;
        default: { teamName = "None"; } break;
    }


    if(!bIgnoreTeam){

        if(teamName === "None") return "None";
        return `${teamName} Team`;
    }else{
        return teamName;
    }
}

export function getTeamColor(team, totalTeams){

    if(totalTeams !== undefined && totalTeams < 2) return "team-none";

    team = parseInt(team);
    
    switch(team){
        case 0: {  return "team-red"; } 
        case 1: {  return "team-blue"; } 
        case 2: {  return "team-green"; } 
        case 3: {  return "team-yellow"; }
        default: { return "team-none";} 
    }
}


/**
 * 
 * @param {*} input 
 * @param {*} min The minimum possible value
 * @param {*} max the maximum possible value, pass null for no limit
 * @param {*} defaultMin If min is not specified or a valid integer use this value instead
 * @param {*} defaultMax If max is not specified or a valid integer use this value instead
 * @returns 
 */
export function cleanInt(input, min, max, defaultMin, defaultMax){;

    if(input === undefined && min === undefined && max === undefined && defaultMin === undefined && defaultMax === undefined){
        throw new Error("No arguments parsed to cleanInt");
    }

    if(input === undefined) return 0;

    const pMin = parseInt(min);
    const pMax = parseInt(max);

    //just in case min is greater than max swap them around
    if(pMin === pMin && pMax === pMax){
        if(pMin > pMax){
            min = pMax;
            max = pMin;
        }
    }
    
    const pDMin = parseInt(defaultMin);
    const pDMax = parseInt(defaultMax);

    //same as above but with default values if specified
    if(pDMin === pDMin && pDMax === pDMax){

        if(pDMin > pDMax){
            defaultMin = pDMax;
            defaultMax = pDMin;
        }
    }

    input = parseInt(input);
    min = parseInt(min);

    if(min !== min){

        if(defaultMin === undefined){
            throw new Error("Minimum value has not been specified and defaultMin value has also not been specified.");
        }
        
        defaultMin = parseInt(defaultMin);

        if(defaultMin !== defaultMin){
            throw new Error("DefaultMin must be a valid integer.");
        }

        min = defaultMin;
    }

    if(input !== input){
        input = min;
    }

    if(input < min) input = min;

    if(max === null && defaultMax == undefined) return input;
    
    max = parseInt(max);

    if(max !== max){

        if(defaultMax === undefined){
            throw new Error("Maximum value has not been specified and defaultMax value has also not been specified.");
        }
        
        if(defaultMax !== null){

            defaultMax = parseInt(defaultMax);

            if(defaultMax !== defaultMax){
                throw new Error("defaultMax must be a valid integer.");
            }

            max = defaultMax;
        }
    }

    if(input > max){
        input = max;
    }

    return input;
}


export function getUniqueValues(data, key){

    const found = [];

    for(let i = 0; i < data.length; i++){

        if(found.indexOf(data[i][key]) === -1){
            found.push(data[i][key]);
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
export function setIdNames(data, names, key, newKey){

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        const currentId = d[key];

        if(names[currentId] !== undefined){
            d[newKey] = names[currentId];
        }else{
            d[newKey] = 'Not Found';
        }
    }
}

export function removeIps(data){

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

export function utDate(input){


    const year = input.slice(0,4);
    const month = input.slice(4,6);
    const day = input.slice(6,8);
    const hour = input.slice(8,10);
    const minute = input.slice(10,12);
    const seconds = input.slice(12,14);

    return Math.floor(new Date(year, month - 1, day, hour, minute, seconds) * 0.001);
}

export function calculateKillEfficiency(kills, deaths){
    
    if(kills === 0) return 0;
    if(deaths === 0 && kills > 0) return 100;
    
    return (kills / (kills + deaths)) * 100;
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


export function sanatizePerPage(value, defaultValue){

    const MIN_PER_PAGE = 5;
    const MAX_PER_PAGE = 100;
    const DEFAULT_PER_PAGE = 25;

    if(defaultValue === undefined){

        defaultValue = DEFAULT_PER_PAGE;

    }else{

        defaultValue = parseInt(defaultValue);
        if(defaultValue !== defaultValue) defaultValue = DEFAULT_PER_PAGE;
        if(defaultValue < MIN_PER_PAGE) defaultValue = MIN_PER_PAGE;
        if(defaultValue > MAX_PER_PAGE) defaultValue = MAX_PER_PAGE;
    }

    value = parseInt(value);

    if(value !== value) value = DEFAULT_PER_PAGE;

    if(value < MIN_PER_PAGE) value = MIN_PER_PAGE;
    if(value > MAX_PER_PAGE) value = MAX_PER_PAGE;

    return value;
}

export function sanatizePage(value){

    value = parseInt(value);
    if(value !== value) return 0;

    if(value < 0) return 0;
    
    return value;
}


export function getGametypePrefix(name){

    const reg = /^(.+?)-.+$/i;

    const result = reg.exec(name);
    if(result === null) return "dm";

    return result[1].toLowerCase();
}

export function toHours(seconds){

    if(seconds === 0) return 0;

    return (seconds / 3600).toFixed(2);
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


export function getMultiTitles(type){

    type = type.toLowerCase();

    if(type === "ut99"){

        return [
            "Double Kill",
            "Multi Kill",
            "Ultra Kill",
            "Monster Kill",
            "Best Multi"
        ];
    }

    if(type === "smartctf"){

        return [
            "Double Kill",
            "Triple Kill",
            "Multi Kill",
            "Mega Kill",
            "Ultra Kill",
            "Monster Kill",
            "Best Multi"
        ];
    }

    if(type === "ut2k4"){

        return [
            "Double Kill",
            "Multi Kill",
            "Mega Kill",
            "Ultra Kill",
            "Monster Kill",
            "Ludicrious Kill",
            "Holy Shit",
            "Best Multi"
        ];
    }

    if(type === "ut3"){

        return [
            "Double Kill",
            "Multi Kill",
            "Mega Kill",
            "Ultra Kill",
            "Monster Kill",
            "Best Multi"
        ];
    }

    return null;
}


/**
 * convert player total data multis to ut99,ut2k4 ect
 */
export function convertMultis(type, data){

    type = type.toLowerCase();

    if(type === "ut99"){

        return [
            data.multi_1,
            data.multi_2,
            data.multi_3,
            data.multi_4 + data.multi_5 + data.multi_6 + data.multi_7,
            data.multi_best
        ];
    }

    if(type === "smartctf"){

        return [
            data.multi_1,
            data.multi_2,
            data.multi_3,
            data.multi_4,
            data.multi_5,
            data.multi_6 + data.multi_7,
            data.multi_best
        ];
    }

    if(type === "ut2k4"){

        return [
            data.multi_1,
            data.multi_2,
            data.multi_3,
            data.multi_4,
            data.multi_5,
            data.multi_6,
            data.multi_7,
            data.multi_best
        ];
    }

    if(type === "ut3"){

        return [
            data.multi_1,
            data.multi_2,
            data.multi_3,
            data.multi_4,
            data.multi_5 +data.multi_6 + data.multi_7,
            data.multi_best
        ];
    }

    return null;
}


export function getSpreeTitles(type){

    type = type.toLowerCase();

    if(type === "ut99"){

        return [
            "Killing Spree",
            "Rampage",
            "Dominating",
            "Unstoppable",
            "Godlike",
            "Best Spree"
        ];
    }

    if(type === "smartctf"){

        return [
             "Killing Spree",
            "Rampage",
            "Dominating",
            "Unstoppable",
            "Godlike",
            "Too Easy",
            "Brutalizing",
            "Best Spree"
        ];
    }

    if(type === "ut2k4"){

        return [
            "Killing Spree",
            "Rampage",
            "Dominating",
            "Unstoppable",
            "Godlike",
            "Whicked Sick",
            "Best Spree"
        ];
    }

    if(type === "ut3"){

        return [
            "Killing Spree",
            "Rampage",
            "Dominating",
            "Unstoppable",
            "Godlike",
            "Massacre",
            "Best Spree"
        ];
    }

    return null;
}


/**
 * convert player total data multis to ut99,ut2k4 ect
 */
export function convertSprees(type, data){

    type = type.toLowerCase();

    if(type === "ut99"){

        return [
            data.spree_1,
            data.spree_2,
            data.spree_3,
            data.spree_4,
            data.spree_5 + data.spree_6 + data.spree_7,
            data.spree_best
        ];
    }

    if(type === "smartctf"){

        return [
            data.spree_1,
            data.spree_2,
            data.spree_3,
            data.spree_4,
            data.spree_5,
            data.spree_6,
            data.spree_7,
            data.spree_best
        ];
    }

    if(type === "ut2k4"){

        return [
            data.spree_1,
            data.spree_2,
            data.spree_3,
            data.spree_4,
            data.spree_5,
            data.spree_6 + data.spree_7,
            data.spree_best
        ];
    }

    if(type === "ut3"){

         return [
            data.spree_1,
            data.spree_2,
            data.spree_3,
            data.spree_4,
            data.spree_5,
            data.spree_6 + data.spree_7,
            data.spree_best
        ];
    }

    return null;
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


export function toMysqlDate(timestamp){


    const date = new Date(timestamp);
    const iso = date.toISOString();

    const reg = /(\d\d\d\d-\d\d-\d\d)T(\d\d:\d\d:\d\d)./i;


    const result = reg.exec(iso);

    if(iso === null) throw new Error(`toMysqlDate Failed to parse ISO Date String`);

    return `${result[1]} ${result[2]}`;
}


export function getFileExtension(fileName){

    const reg = /^.+\.(.+)$/i;

    const result = reg.exec(fileName);

    if(result === null) return null;

    return result[1].toLowerCase();
}


export function stripFileExtension(fileName){

    const reg = /^(.+)\..+$/i;

    const result = reg.exec(fileName);

    if(result === null) return null;

    return result[1];
}


export function sortByName(a, b){

    a = a.name.toLowerCase();
    b = b.name.toLowerCase();

    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
}