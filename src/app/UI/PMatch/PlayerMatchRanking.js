"use client"
import InteractiveTable from "../InteractiveTable";
import RankingIcon from "../Rankings/RankingIcon";
import { getOrdinal } from "../../../../api/generic.mjs";

function renderData(position, matchChange, currentRanking){

    const headers = {
        "pos": "Current Position",
        "current": "Current Ranking",
        "previous": "Ranking Before Match",
        "after": "Ranking After Match",
        "match": "Match Ranking Score"
    };

    const previous = matchChange.ranking - matchChange.ranking_change;

    const data = {
        "pos": {"value": position, "displayValue": `${position}${getOrdinal(position)}`},
        "current": {
            "value": currentRanking.ranking, 
            "displayValue": <>
                {parseFloat(currentRanking.ranking).toFixed(2)}
                <RankingIcon change={currentRanking.ranking_change}/>
            </>
        },
        "previous": {
            "value": previous, 
            "displayValue": previous.toFixed(2)
        },
        "after": {
            "value": matchChange.ranking,
            "displayValue": <>
                {parseFloat(matchChange.ranking).toFixed(2)}
                <RankingIcon change={matchChange.ranking_change}/>
            </>
        },
        "match": {"value": matchChange.match_ranking, "displayValue": parseFloat(matchChange.match_ranking).toFixed(2)}
    };

    return <InteractiveTable width={1} headers={headers} data={[data]}/>
}

export default function PlayerMatchRanking({data}){

    return <>
        <div className="default-header">Rankings Summary</div>
        {renderData(data.currentPosition, data.matchChanges, data.currentRankings)}
    </>
}