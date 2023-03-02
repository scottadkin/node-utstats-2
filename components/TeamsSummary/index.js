import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import Loading from '../Loading';
import {React, useEffect, useReducer, useState} from "react";
import ErrorMessage from '../ErrorMessage';
import InteractiveTable from '../InteractiveTable';


const TeamsSummary = ({matchId, matchStart, players, playerData, totalTeams}) =>{


    const [displayMode, setDisplayMode] = useState(0);

    const reducer = (state, action) =>{

        switch(action.type){
            case "loaded": {
                return {
                    "bLoading": false,
                    "error": null,
                    "teamsData": action.teamsData
                }
            }
            case "error":{
                return {
                    "bLoading": false,
                    "error": action.errorMessage
                }
            }
            default: return {...state}
        }
    }

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null
    });
    

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            const req = await fetch("/api/match", {
                "singal": controller.signal,
                "headers":{
                    "Content-type": "application/json"
                },
                "method": "POST",
                "body": JSON.stringify({"mode": "teams", "matchId": matchId})
            });

            const res = await req.json();

            if(res.error !== undefined){
                dispatch({"type": "error", "errorMessage": res.error});
            }else{
                dispatch({"type": "loaded", "teamsData": res.data});
            }
        }

        loadData();

        return () =>{
            controller.abort();
        }

    }, [matchId]);

    const createTeamChangeString = (teamId) =>{

        if(totalTeams >= 2 && teamId !== 255){

            return <>Joined the <b>{Functions.getTeamName(teamId)}</b>.</>;
        }

        if(totalTeams >= 2 && teamId === 255){
            return <>Joined the server as a spectator.</>;
        }

        return <>Joined the Server.</>
        
    }

    const renderTeamChanges = () =>{

        if(displayMode !== 0) return null;

        const headers = {
            "time": "Timestamp",
            "player": "Player",
            "info": "Info"
        };


        const data = state.teamsData.map((teamChange) =>{

            const player = Functions.getPlayer(players, teamChange.player, true);
    
            const teamColor = Functions.getTeamColor(teamChange.team);

            return {
                "time": {
                    "value": teamChange.timestamp,
                    "displayValue": Functions.MMSS(teamChange.timestamp - matchStart)
                },
                "player": {
                    "value": player.name.toLowerCase(),
                    "displayValue": <Link href={`/pmatch/${matchId}/?player=${player.id}`}>
                        <a>
                            <CountryFlag country={player.country}/>{player.name}
                        </a>
                    </Link>,
                    "className": `player ${teamColor}`
                },
                "info": {
                    "value": teamChange.team,
                    "displayValue": createTeamChangeString(teamChange.team),
                }
            };
        });


        return <InteractiveTable width={4} headers={headers} data={data}/>

    }


    const renderPlaytimeInfo = () =>{

        if(displayMode !== 1) return null;

        const headers = {
            "player": "Player",
            "totalPlaytime": "Playtime"
        };

        for(let i = 0; i < totalTeams; i++){

            headers[`team_${i}_playtime`] = `${Functions.getTeamName(i, true)} Playtime`;
        }

        headers[`spec_playtime`] = `Spectator Time`;

        const data = playerData.map((player) =>{

            const currentData = {
                "player": {
                    "value": player.name.toLowerCase(), 
                    "displayValue": <Link href={`/pmatch/${matchId}/?player=${player.player_id}`}>
                        <a>
                            <CountryFlag country={player.country}/>{player.name}
                        </a>
                    </Link>,
                    "className": `player`
                },
                "totalPlaytime": {
                    "value": player.playtime,
                    "displayValue": Functions.toPlaytime(player.playtime),
                    "className": "playtime"
                }
            }

            for(let i = 0; i < totalTeams; i++){

                currentData[`team_${i}_playtime`] = {
                    "value": player[`team_${i}_playtime`],
                    "displayValue": Functions.toPlaytime(player[`team_${i}_playtime`]),
                    "className": "playtime"
                }
            }

            currentData[`spec_playtime`] = {
                "value": player[`spec_playtime`],
                "displayValue": Functions.toPlaytime(player[`spec_playtime`]),
                "className": "playtime"
            }

            return currentData;
        });

        return <InteractiveTable width={1} headers={headers} data={data}/>

    }

    const renderTabs = () =>{

        if(totalTeams < 2) return null;

        return <div className="tabs">
            <div className={`tab ${(displayMode === 0) ? "tab-selected" : "" }`} onClick={() => setDisplayMode(0)}>Team Changes</div>
            <div className={`tab ${(displayMode === 1) ? "tab-selected" : "" }`} onClick={() => setDisplayMode(1)}>Team Playtime</div>
        </div>
    }


    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Teams Summary" text={state.error}/>

    return <div>
        <div className="default-header">Teams Summary</div>
        {renderTabs()}
        {renderTeamChanges()}
        {renderPlaytimeInfo()}
    </div>
}

export default TeamsSummary;