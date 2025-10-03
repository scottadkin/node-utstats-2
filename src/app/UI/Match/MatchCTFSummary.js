
"use client"
import MatchCTFSummaryDefault from "./MatchCTFSummaryDefault";
import MatchCTFSummaryCovers from "./MatchCTFSummaryCovers";
import MatchCTFSummarySeals from "./MatchCTFSummarySeals";
import MatchCTFSummaryReturns from "./MatchCTFSummaryReturns";
import MatchCTFSummaryKills from "./MatchCTFSummaryKills";
import {useState} from "react";
import Tabs from "../Tabs";


function renderDefault(mode, matchId, playerData, single){

    if(mode !== 0) return null;
    return <MatchCTFSummaryDefault matchId={matchId} playerData={playerData} single={single}/>;
}

function renderCovers(mode, matchId, playerData, single){

    if(mode !== 1) return null;
    return <MatchCTFSummaryCovers matchId={matchId} playerData={playerData} single={single}/>;
}

function renderSeals(mode, matchId, playerData, single){

    if(mode !== 2) return null;
    return <MatchCTFSummarySeals matchId={matchId}  playerData={playerData} single={single} />;
}

function renderReturns(mode, matchId, playerData, single){

    if(mode !== 3) return null;
    return <MatchCTFSummaryReturns matchId={matchId}  playerData={playerData} single={single}/>;
}
    
function renderFlagKills(mode, playerData, single, flagKills) {

    if(mode !== 4) return null;
    return <MatchCTFSummaryKills playerData={playerData} single={single} flagKills={flagKills}/>;
}

export default function MatchCTFSummary({matchId, mapId, playerData, single, flagKills}){

    const [mode, setMode] = useState(4);

    

    const headerOptions = [
        {"name": "General", "value": 0},
        {"name": "Covers", "value": 1},
        {"name": "Seals", "value": 2},
        {"name": "Returns", "value": 3},
        {"name": "Flag Kills", "value": 4},
    ];
    

    return <div>
        <div className="default-header">Capture The Flag Summary</div>
        <Tabs selectedValue={mode} changeSelected={(a) => setMode(a)} options={headerOptions}/>
        {renderDefault(mode, matchId, playerData, single)}
        {renderCovers(mode, matchId, playerData, single)}
        {renderSeals(mode, matchId, playerData, single)}
        {renderReturns(mode, matchId, playerData, single)}
        {renderFlagKills(mode, playerData, single, flagKills)}
    </div>
}