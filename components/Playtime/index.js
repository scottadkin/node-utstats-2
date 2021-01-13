const Playtime = ({seconds}) =>{


    let currentMinutes = Math.floor(seconds / 60);

    let currentSeconds = Math.floor(seconds % 60);



    let secondString = (currentSeconds > 1) ? "Secs" : "Sec";
    let minuteString = (currentMinutes > 1) ? "Mins" : "Min";

 
    let string = `${currentMinutes} ${minuteString}, ${currentSeconds} ${secondString}`;

    if(currentMinutes >= 1){

        if(currentSeconds === 0){
            string = `${currentMinutes} ${minuteString}`;
        }
    }

    if(currentMinutes === 0){
        string = `${currentSeconds} ${secondString}`;
    }

    

    return (<span>
        {string}
    </span>);
}


export default Playtime;