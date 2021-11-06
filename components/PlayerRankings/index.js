import MouseHoverBox from '../MouseHoverBox/';
import Functions from '../../api/functions';
import Table2 from '../Table2';

const PlayerRankings = ({data, gametypeNames, positions}) =>{

    data = JSON.parse(data);
    gametypeNames = JSON.parse(gametypeNames);
    positions = JSON.parse(positions);

    const rows = [];

    let d = 0;

    let icon = "";
    let rankingString = "";
    let currentName = "";
    let position = 0;

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

        position = (positions[d.gametype] !== undefined) ? positions[d.gametype]  : "-1" ;

        rows.push(<tr key={i}>
            <td>{currentName}</td>
            <td>{d.matches}</td>
            <td>{(d.playtime / (60 * 60)).toFixed(2)} Hours</td>
            <td><span className="ranking-position">({position}{Functions.getOrdinal(position)})</span><img className="ranking-icon" src={icon} alt="image"/>
            
            <MouseHoverBox title={`Previous Match Ranking Change`} 
                    content={rankingString} 
                    display={d.ranking.toFixed(2)} />
            </td>
        </tr>);
    }

    return <div>
        <div className="default-header">Rankings</div>
        <Table2 width={1} players={true}>
            <tr>
                <th>Gametype</th>
                <th>Matches</th>
                <th>Playtime</th>
                <th>Ranking</th>
            </tr>
            {rows}
        </Table2>
    </div>
}

export default PlayerRankings;