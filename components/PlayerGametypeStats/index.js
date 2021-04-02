
const PlayerGametypeStats = ({data, names}) =>{

    data = JSON.parse(data);
    names = JSON.parse(names);

    data.sort((a, b) =>{

        a = a.playtime;
        b = b.playtime;

        if(a < b){
            return 1;
        }else if(a > b){
            return -1;
        }

        return 0;
    });

    const elems = [];

    let d = 0;

    let winrate = 0;

    let totalWins = 0;
    let totalLosses = 0;
    let totalDraws = 0;
    let totalMatches = 0;
    let totalPlaytime = 0;
    let totalWinrate = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        winrate = 0;

        if(d.matches > 0){

            if(d.wins > 0){

                if(d.losses + d.draws === 0){
                    winrate = 1;
                }else{

                    winrate = ((d.wins / d.matches) * 100).toFixed(2);
                }
            }
        }

        totalWins += d.wins;
        totalLosses += d.losses;
        totalDraws += d.draws;
        totalMatches += d.matches;
        totalPlaytime += d.playtime;


        elems.push(<tr key={i}>
            <td>{(names[d.gametype] !== undefined) ? names[d.gametype] : "Not Found"}</td>
            <td>{d.wins}</td>
            <td>{d.losses}</td>
            <td>{d.draws}</td>
            <td>{winrate}%</td>
            <td>{d.matches}</td>
            <td>{(d.playtime / (60 * 60)).toFixed(2)} Hours</td>
        </tr>);
    }

    if(totalWins > 0){

        if(totalLosses + totalDraws === 0){
            totalWinrate = 1;
        }else{
            totalWinrate = ((totalWins / totalMatches) * 100).toFixed(2);
        }
    }


    elems.push(<tr key={"total"} className="black">
        <td>Totals</td>
        <td>{totalWins}</td>
        <td>{totalLosses}</td>
        <td>{totalDraws}</td>
        <td>{totalWinrate}%</td>
        <td>{totalMatches}</td>
        <td>{(totalPlaytime / (60 * 60)).toFixed(2)} Hours</td>

    </tr>);

    return <div className="special-table">
        <div className="default-header">Gametype Stats</div>
        <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Gametype</th>
                    <th>Wins</th>
                    <th>Losses</th>
                    <th>Draws</th>
                    <th>Win Rate</th>
                    <th>Matches</th>
                    <th>Playtime</th>
                </tr>
                {elems}
            </tbody>
        </table>
    </div>
}


export default PlayerGametypeStats;