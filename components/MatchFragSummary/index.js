import {React, useState} from 'react';
import MatchFragTable from '../MatchFragTable/';
import MatchFragDistances from '../MatchFragDistances/';

const MatchFragSummary = ({matchId, playerData, totalTeams, single}) =>{

    const [mode, setMode] = useState(0);
    const [separateByTeam, setSeparateByTeam] = useState(true);

    const bAnyDistanceData = () =>{

        const types = [
            "shortest_kill_distance", 
            "average_kill_distance", 
            "longest_kill_distance",
            "k_distance_normal",
            "k_distance_long",
            "k_distance_uber"
        ];

        for(let i = 0; i < playerData.length; i++){

            const p = playerData[i];

            for(let x = 0; x < types.length; x++){

                if(p[types[x]] !== 0){
                    return true;
                }
            }
        }

        return false;
    }

    const renderTabs = () =>{

        if(!bAnyDistanceData()) return null;

        return <div className="tabs">
            <div onClick={() => setMode(0)} className={`tab ${(mode === 0) ? "tab-selected" : "" }`}>General Data</div>
            <div onClick={() => setMode(1)} className={`tab ${(mode === 1) ? "tab-selected" : "" }`}>Kill Distances</div>
        </div>         
    }

    const renderDefaultTable = () =>{

        if(mode !== 0) return null;

        return <MatchFragTable 
            playerData={playerData} 
            totalTeams={totalTeams} 
            bSeparateByTeam={separateByTeam} 
            highlight={null}
            matchId={matchId}
            single={single}
        />
    }

    const renderDistanceTable = () =>{

        if(mode !== 1) return null;

        return <MatchFragDistances 
            playerData={playerData} 
            totalTeams={totalTeams} 
            bSeparateByTeam={separateByTeam} 
            highlight={null}
            matchId={matchId}
            single={single}
        />
    }

    const renderTeamTabs = () =>{

        if(single) return null;
        
        return <div className="tabs">
            <div onClick={() => setSeparateByTeam(true)} className={`tab ${(separateByTeam) ? "tab-selected" : ""}`}>Separate by Team</div>
            <div onClick={() => setSeparateByTeam(false)} className={`tab ${(!separateByTeam) ? "tab-selected" : ""}`}>Display All</div>
        </div>
    }

    return <div>
        <div className="default-header">Frags Summary</div>
        {renderTabs()}
        {renderTeamTabs()}
        {renderDefaultTable()}
        {renderDistanceTable()}
    </div>
}

export default MatchFragSummary;
