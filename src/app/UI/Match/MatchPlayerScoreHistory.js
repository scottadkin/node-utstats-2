"use client"
import CustomGraph from "../CustomGraph";
import {MMSS, scalePlaytime} from "../../../../api/generic.mjs";


export default function MatchPlayerScoreHistory({graphData, matchId, players, bHardcore, matchStart, matchEnd}){

    if(graphData === null) return null;

    const labels = graphData.labels.map((l) =>{
        return MMSS(scalePlaytime(l - matchStart, bHardcore));
    });

    labels.push(MMSS(scalePlaytime(matchEnd - matchStart, bHardcore)));
    labels.unshift(MMSS(0));


    return <>
        <div className="default-header">Player Score Graph</div>
        <CustomGraph 
            tabs={[
                {"name": "Player Score History", "title": "Player Score Over Time"}
            ]}
            data={[
                graphData.data
            ]}
            labels={[
                labels
            ]}
            labelsPrefix={[
                "Player Score at "
            ]}
        />
    </>
}