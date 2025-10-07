"use client"
import Link from 'next/link';
import CountryFlag from '../CountryFlag';
import InteractiveTable from '../InteractiveTable';
import MouseOver from '../../../../components/MouseOver';
import { getOrdinal, getPlayerFromMatchData, getTeamColor } from '../../../../api/generic.mjs';

function getIcon(value){

    if(value > 0){
        return "/images/up.png";
    }else if(value < 0){
        return "/images/down.png";
    }

    return "/images/nochange.png";  
}

function getPlayerPosition(data, playerId){

    if(data.currentPositions[playerId] !== undefined){

        const pos = data.currentPositions[playerId];
        return `${pos}${getOrdinal(pos)}`
    }

    return -1;
}

function getPlayerMatchChanges(data, playerId){

    for(let i = 0; i < data.matchChanges.length; i++){

        const m = data.matchChanges[i];

        if(m.player_id === playerId) return m;
    }

    return null;
}

function getRankingChangeString(value){

    value = parseFloat(value);

    if(value > 0){
        return <>Player gained <b>{value.toFixed(2)}</b> ranking points.</>
    }

    if(value < 0){
        return <>Player lost <b>{Math.abs(value).toFixed(2)}</b> ranking points.</>
    }

    return <>There was no change to the player&apos;s rankings score.</>;
}

export default function MatchRankingChanges({matchId, players, data}){

    if(data === null) return null;

    const headers = {
        "player": "Player",
        "previous": "Previous Ranking",
        "after": "Ranking After Match",
        "match": "Match Ranking",
        "current": "Current Ranking"
    };

    const rows = [];

    for(let i = 0; i < data.currentRankings.length; i++){

        const c = data.currentRankings[i];

        const player = getPlayerFromMatchData(players, c.player_id);

        const currentIcon = getIcon(c.ranking_change);

        const matchChange = getPlayerMatchChanges(data, c.player_id);

        if(matchChange === null) continue;

        const diff = matchChange.ranking - matchChange.ranking_change;

        const previousRanking = matchChange.ranking - diff;

        const diffIcon = getIcon(diff);
        const previousIcon = getIcon(previousRanking - matchChange.ranking);

        const currentRanking =  (matchChange.ranking !== undefined) ? parseFloat(matchChange.ranking) : 0;
        const matchRanking =  (matchChange.match_ranking !== undefined) ? parseFloat(matchChange.match_ranking) : 0;

        
        rows.push({
            "player": {
                "value": player.name.toLowerCase(),
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${player.id}`}>
                    
                        <CountryFlag country={player.country}/>{player.name}
                    
                </Link>,
                "className": `player ${getTeamColor(player.team)}`
            },
            "previous": {
                "value": previousRanking,
                "displayValue": <><img className="ranking-icon" src={previousIcon} alt="image"/>{parseFloat(previousRanking).toFixed(2)}</>
            },
            "after": {
                "value": currentRanking, 
                "displayValue": <MouseOver title="Player Latest Ranking Change" display={getRankingChangeString(diff)}>
                    <img className="ranking-icon" src={diffIcon} alt="image"/>
                    {currentRanking.toFixed(2)}
                </MouseOver>
            },
            "match": {
                "value": matchRanking, 
                "displayValue": matchRanking.toFixed(2)
            },
            "current": {
                "value": c.ranking, 
                "displayValue": <MouseOver title="Player Latest Ranking Change" display={getRankingChangeString(c.ranking_change)}>
                    <span className="ranking-position">{getPlayerPosition(data, c.player_id)}</span>
                    <img className="ranking-icon" src={currentIcon} alt="image"/>
                    {parseFloat(c.ranking).toFixed(2)}
                </MouseOver>
            }
        });
    }
   

    return <div>
        <div className="default-header">Match Ranking Changes</div>
        <InteractiveTable width={1} headers={headers} data={rows}/>
    </div>
}