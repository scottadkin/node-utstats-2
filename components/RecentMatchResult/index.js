const RecentMatchResult = ({teamGame, dmWinner, dmWinnerScore, redScore, blueScore, greenScore, yellowScore}) =>{

    let dmString = "";

    if(!teamGame){
        dmString = `${dmWinner} won with ${dmWinnerScore} frags`;
    }

    return (
    <div>
       {dmString}
    </div>
    );
}

export default RecentMatchResult;