
const getDayName = (day) =>{

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


const getMonthName = (month) =>{

    switch(month){
        case 0: { return 'January'; } 
        case 1: { return 'February'; } 
        case 2: { return 'March'; } 
        case 3: { return 'April'; } 
        case 4: { return 'May'; } 
        case 5: { return 'June'; } 
        case 6: { return 'July'; } 
        case 7: { return 'August'; } 
        case 8: { return 'September'; } 
        case 9: { return 'October'; } 
        case 10: { return 'November'; } 
        case 11: { return 'December'; } 
    }
}

const getOrdinal = (number) =>{

    const twoDigits = number % 100;

    if(twoDigits >= 10 && twoDigits <= 20){
        return 'th';
    }

    const singleDigit = number % 10;

    if(singleDigit === 1){
        return 'st';
    }else if(singleDigit === 2){
        return 'nd';
    }else if(singleDigit === 3){
        return 'rd';
    }

    return 'th';
}

const convertTimestamp = ({timestamp}) =>{

    const now = new Date();
    now.setTime(timestamp * 1000);

    const year = now.getFullYear();
    const month = now.getMonth();
    const dayName = now.getDay();
    const day = now.getDate();
    const hour = now.getHours();
    let minute = now.getMinutes();
    
    if(minute < 10) minute = `0${minute}`;

    return `${getDayName(dayName)} ${day}${getOrdinal(day)} ${getMonthName(month)} ${year}  ${hour}:${minute}`;

}

const TimeStamp = (timestamp) =>{

    return (<span>
        {convertTimestamp(timestamp)}
    </span>);

}


export default TimeStamp;