import CountryFlag from '../../CountryFlag';
import Link from 'next/link';
import Functions from '../../../api/functions';
import MouseHoverBox from '../../MouseHoverBox';

const MatchRankingSummary = ({data, players, teams}) =>{

    const rows = [];

    let playtime = 0;
    let currentPlayer = 0;

    data.sort((a, b) =>{

        a = a.position;
        b = b.position;

        if(a > b){
            return 1;
        }else if(a < b){
            return -1;
        }
        
        return 0;
    });

    let d = 0;
    let rankingString = "";

    for(let i = 0; i < data.length; i++){

        d = data[i];
        playtime = 0;

        if(d.time > 0){
            playtime = d.time / 60;
        }

        currentPlayer = players[d.player];

        if(currentPlayer === undefined){

            currentPlayer = {
                "name": "Not Found",
                "country": "",
                "id": -1,
                "team": 255
            };
        }

        if(d.difference === 0){
            rankingString = `There was no change to ${currentPlayer.name} ranking score.`;
        }else if(d.difference > 0){
            rankingString = `${currentPlayer.name} gained ${d.difference.toFixed(2)} ranking points.`;
        }else{
            rankingString = `${currentPlayer.name} lost ${d.difference.toFixed(2)} ranking points.`;
        }


        rows.push(<tr key={i}>
            <td className={(teams > 0) ? Functions.getTeamColor(currentPlayer.team) : null}>
                <Link href={`/classic/pmatch/${currentPlayer.id}`}>
                    <a>    
                        <span className="ranking-position">({d.position}{Functions.getOrdinal(d.position)})</span>
                        <CountryFlag country={currentPlayer.country}/>{currentPlayer.name}
                    </a>
                </Link>
            </td>
            <td>{playtime.toFixed(2)} Hours</td>
            <td>{d.matches}</td>
            <td>
                <img className="ranking-icon" src={`/images/${d.change}.png`} alt="icon"/>
                <MouseHoverBox title="Ranking Change" content={rankingString} display={d.rank.toFixed(2)}/>
            
            </td>
        </tr>);
    }

    if(rows.length === 0) return null;

    return <div className="m-bottom-25">
        <div className="default-header">Rankings Summary</div>
        <table className="t-width-2 td-1-left td-1-150">
            <tbody>
                <tr>
                    <th>Player</th>
                    <th>Playtime</th>
                    <th>Matches</th>
                    <th>Points</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}

export default MatchRankingSummary;