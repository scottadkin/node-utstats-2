const MMSS = ({timestamp}) =>{

    timestamp = parseInt(timestamp);
    let seconds = '00';
    let minutes = '00';

    if(timestamp > 0){
        seconds = Math.floor(timestamp % 60);
        minutes = Math.floor(timestamp / 60);

        if(seconds < 10){
            seconds = `0${seconds}`;
        }

        if(minutes < 10){
            minutes = `0${minutes}`;
        }
    }

    return (
        <span>
            {minutes}:{seconds}
        </span>
    );
}


export default MMSS;