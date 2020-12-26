const Playtime = ({seconds}) =>{


    let currentMinutes = Math.floor(seconds / 60);

    let currentSeconds = Math.floor(seconds % 60);



    let secondString = (currentSeconds > 1) ? "Seconds" : "Second";
    let minuteString = (currentMinutes > 1) ? "Minutes" : "Minute";

    let string = `${currentMinutes} ${minuteString}, ${currentSeconds} ${secondString}`;

    if(currentMinutes === 0){
        string = `${currentSeconds} ${secondString}`;
    }

    

    return (<span>
        {string}
    </span>);
}


export default Playtime;