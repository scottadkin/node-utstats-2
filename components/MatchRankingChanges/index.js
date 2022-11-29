import Link from 'next/link';
import CountryFlag from '../CountryFlag/';
import Functions from '../../api/functions';
import MouseHoverBox from '../../components/MouseHoverBox';
import Table2 from '../Table2';
import Image from 'next/image';

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

const MatchRankingChanges = ({host, changes, currentRankings, playerNames, positions, matchId}) =>{

    changes = JSON.parse(changes);
    playerNames = JSON.parse(playerNames);

    currentRankings = JSON.parse(currentRankings);
    positions = JSON.parse(positions);

    const rows = [];

    let c = 0;

    let player = "";

    let previousRanking = 0;
    let currentRanking = 0;

    let icon1 = "";
    let icon2 = "";
    let icon3 = "";

    let rankingString = "";

    for(let i = 0; i < changes.length; i++){

        c = changes[i];

        player = Functions.getPlayer(playerNames, c.player_id);

        previousRanking = c.ranking - c.ranking_change;
        currentRanking = getCurrentRankings(currentRankings, c.player_id);

        icon2 = getIcon(currentRanking.ranking_change);
        icon3 = getIcon(c.ranking_change);


        if(currentRanking.ranking_change > 0){

            rankingString = `Gained ${currentRanking.ranking_change.toFixed(2)} in the previous match.`;

        }else if(currentRanking.ranking_change < 0){
            rankingString = `Lost ${currentRanking.ranking_change.toFixed(2)} in the previous match.`;
        }else{
            rankingString = `No change in the previous match.`;
        }

        rows.push(<tr key={i}>
            <td><Link href={`/pmatch/${matchId}?player=${c.player_id}`}><a><CountryFlag host={host} country={player.country}/>{player.name}</a></Link></td>
            <td>{previousRanking.toFixed(2)}</td>
            <td><Image width={14} height={14} className="ranking-icon" src={icon3} alt="icon"/> {c.ranking.toFixed(2)}</td>
            <td><Image width={14} height={14} className="ranking-icon" src={icon3} alt="icon"/> {c.ranking_change.toFixed(2)}</td>
            <td>{c.match_ranking.toFixed(2)}</td>
            <td><span className="ranking-position">({positions[c.player_id]}{Functions.getOrdinal(positions[c.player_id])})</span><Image width={14} height={14} className="ranking-icon" src={icon2} alt="icon"/> <MouseHoverBox title="Ranking Change" content={rankingString} display={currentRanking.ranking.toFixed(2)}/></td>
        </tr>);
    }

    return <div className="m-bottom-25">
        <div className="default-header">
            Match Ranking Changes
        </div>
        <Table2 width={1} players={true}>
            <tr>
                <th>Player</th>
                <th>Previous Ranking</th>
                <th>Ranking After Match</th>
                <th>Ranking Change</th>
                <th>Match Ranking</th>
                <th>Current Ranking</th>
            </tr>
            {rows}
        </Table2>
    </div>
}

export default MatchRankingChanges;