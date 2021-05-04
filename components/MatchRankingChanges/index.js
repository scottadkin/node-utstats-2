import Link from 'next/link';
import CountryFlag from '../CountryFlag/';
import Functions from '../../api/functions';

function getCurrentRankings(rankings, player){

    let r = 0;

    for(let i = 0; i < rankings.length; i++){

        r = rankings[i];

        if(r.player_id === player){
            return r;
        }
    }

    return {"player_id": -1, "ranking": 0, "ranking_change": 0};
}


function getIcon(value){

    if(value > 0){
        return "/images/up.png";
    }else if(value < 0){
        return "/images/down.png";
    }else{
        return "/images/nochange.png";
    }
}

const MatchRankingChanges = ({changes, currentRankings, playerNames}) =>{

    changes = JSON.parse(changes);
    playerNames = JSON.parse(playerNames);

    currentRankings = JSON.parse(currentRankings);

    console.table(currentRankings);

    const rows = [];

    let c = 0;

    let player = "";

    let previousRanking = 0;
    let currentRanking = 0;

    let icon1 = "";
    let icon2 = "";
    let icon3 = "";

    for(let i = 0; i < changes.length; i++){

        c = changes[i];

        player = Functions.getPlayer(playerNames, c.player_id);

        previousRanking = c.match_ranking - c.ranking_change;
        currentRanking = getCurrentRankings(currentRankings, c.player_id);

        icon2 = getIcon(currentRanking.ranking_change);
        icon3 = getIcon(c.match_ranking_change);

        rows.push(<tr>
            <td><Link href={`/player/${c.player_id}`}><a><CountryFlag country={player.country}/>{player.name}</a></Link></td>
            <td>{previousRanking.toFixed(2)}</td>
            <td><img className="ranking-icon" src={icon3} alt="icon"/>{c.ranking.toFixed(2)}</td>
            <td><img className="ranking-icon" src={icon3} alt="icon"/>{c.match_ranking_change.toFixed(2)}</td>
            <td>{c.match_ranking.toFixed(2)}</td>
            <td><img className="ranking-icon" src={icon2} alt="icon"/>{currentRanking.ranking}</td>
        </tr>);
    }

    return <div className="m-bottom-25">
        <div className="default-header">
            Match Ranking Changes
        </div>
        <table className="t-width-1 td-1-left">
            <tbody>
                <tr>
                    <th>Player</th>
                    <th>Previous Ranking</th>
                    <th>Ranking After Match</th>
                    <th>Ranking Change</th>
                    <th>Match Ranking</th>
                    <th>Current Ranking</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}

export default MatchRankingChanges;