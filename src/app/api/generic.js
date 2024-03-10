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
