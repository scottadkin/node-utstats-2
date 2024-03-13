export function getTeamColorClass(value){

    value = parseInt(value);

    if(value === 0) return "team-red";
    if(value === 1) return "team-blue";
    if(value === 2) return "team-green";
    if(value === 3) return "team-yellow";

    return "team-none";
}


export function getTeamIcon(value){

    value = parseInt(value);

    if(value === 0) return "red.png";
    if(value === 1) return "blue.png";
    if(value === 2) return "green.png";
    if(value === 3) return "yellow.png";

    return "controlpoint.png"
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


export function ignore0(value){

    const pValue = parseInt(value);

    if(pValue !== pValue) return value;

    if(pValue === 0) return "";

    return value;
    
}