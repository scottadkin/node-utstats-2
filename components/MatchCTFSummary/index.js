import MatchCTFSummaryDefault from "../MatchCTFSummaryDefault/";
import MatchCTFSummaryCovers from "../MatchCTFSummaryCovers/";
import MatchCTFSummarySeals from "../MatchCTFSummarySeals/";
import MatchCTFSummaryReturns from "../MatchCTFSummaryReturns/";
import MatchCTFSummaryKills from "../MatchCTFSummaryKills";
import {React, useState} from "react";

const MatchCTFSummary = ({matchId, mapId, playerData, single}) =>{

    const [mode, setMode] = useState(4);

    const renderDefault = () =>{

        if(mode !== 0) return null;
        return <MatchCTFSummaryDefault matchId={matchId} playerData={playerData} single={single}/>;
    }

    const renderCovers = () =>{

        if(mode !== 1) return null;
        return <MatchCTFSummaryCovers matchId={matchId} playerData={playerData} single={single}/>;
    }

    const renderSeals = () =>{

        if(mode !== 2) return null;
        return <MatchCTFSummarySeals matchId={matchId}  playerData={playerData}single={single} />;
    }

    const renderReturns = () =>{

        if(mode !== 3) return null;
        return <MatchCTFSummaryReturns matchId={matchId}  playerData={playerData} single={single}/>;
    }
    

    const renderFlagKills = () =>{

        if(mode !== 4) return null;
        return <MatchCTFSummaryKills matchId={matchId} mapId={mapId}  playerData={playerData} single={single}/>;
    }
    

    return <div>
        <div className="default-header">Capture The Flag Summary</div>
        <div className="tabs">
            <div className={`tab ${(mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                setMode(0);
            })}>General</div>
            <div className={`tab ${(mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                setMode(1);
            })}>Covers</div>
            <div className={`tab ${(mode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                setMode(2);
            })}>Seals</div>
            <div className={`tab ${(mode === 3) ? "tab-selected" : ""}`} onClick={(() =>{
                setMode(3);
            })}>Returns</div>
            <div className={`tab ${(mode === 4) ? "tab-selected" : ""}`} onClick={(() =>{
                setMode(4);
            })}>Flag Kills</div>
        </div>
        {renderDefault()}
        {renderCovers()}
        {renderSeals()}
        {renderReturns()}
        {renderFlagKills()}
    </div>
}
export default MatchCTFSummary;
