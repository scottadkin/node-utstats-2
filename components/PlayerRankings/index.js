import MouseHoverBox from '../MouseHoverBox/';

const PlayerRankings = ({data, gametypeNames}) =>{

    data = JSON.parse(data);
    gametypeNames = JSON.parse(gametypeNames);

    const rows = [];

    let d = 0;

    let icon = "";
    let rankingString = "";
    let currentName = "";

    for(let i = 0; i < data.length; i++){

        d = data[i];

        if(d.ranking_change > 0){
            icon = "/images/up.png";
            rankingString = `Gained ${d.ranking_change.toFixed(2)} in the previous match.`;
        }else if(d.ranking_change < 0){
            icon = "/images/down.png";
            rankingString = `Lost ${d.ranking_change.toFixed(2)} in the previous match.`;
        }else{
            icon = "/images/nochange.png";
            rankingString = `No change in the previous match.`;
        }

        currentName = (gametypeNames[d.gametype] !== undefined) ? gametypeNames[d.gametype] : "Not Found";

        rows.push(<tr>
            <td>{currentName}</td>
            <td>{d.matches}</td>
            <td>{(d.playtime / (60 * 60)).toFixed(2)} Hours</td>
            <td><img className="ranking-icon" src={icon} alt="image"/>
            <MouseHoverBox title={`Previous Match Ranking Change`} 
                    content={rankingString} 
                    display={d.ranking.toFixed(2)} />
            </td>
        </tr>);
    }

    return <div>
        <div className="default-header">Rankings</div>
        <table className="t-width-1 td-1-left">
            <tbody>
                <tr>
                    <th>Gametype</th>
                    <th>Matches</th>
                    <th>Playtime</th>
                    <th>Ranking</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}

export default PlayerRankings;