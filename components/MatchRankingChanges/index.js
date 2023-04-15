import Link from 'next/link';
import CountryFlag from '../CountryFlag/';
import Functions from '../../api/functions';
import {React, useEffect, useReducer} from "react";
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';
import InteractiveTable from '../InteractiveTable';
import MouseOver from '../MouseOver';

const MatchRankingChanges = ({matchId, players, gametype}) =>{

    const reducer = (state, action) =>{

        switch(action.type){
            case "loaded": {
                return {
                    "bLoading": false,
                    "error": null,
                    "matchChanges": action.matchChanges,
                    "currentPositions": action.currentPositions,
                    "currentRankings": action.currentRankings
                }
            }
            case "loadError": {
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
        "error": null,
        "currentPositions": [],
        "currentRankings": [],
        "matchChanges": []
    });

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            const req = await fetch("/api/match",{
                "signal": controller.signal,
                "headers": {
                    "Content-type": "application/json"
                },
                "method": "POST",
                "body": JSON.stringify({
                    "mode": "ranking", 
                    "matchId": matchId,
                    "gametypeId": gametype,
                    "playerIds": Object.keys(players)
                })
            });

            const res = await req.json();
            if(res.error !== undefined){
                dispatch({"type": "loadError", "errorMessage": res.error.toString()});
            }else{
                dispatch({
                    "type": "loaded", 
                    "matchChanges": res.matchChanges, 
                    "currentPositions": res.currentPositions,
                    "currentRankings": res.currentRankings
                });
            }
        }

        loadData();

        return () =>{
            controller.abort();
        }

    },[matchId, gametype, players]);


    const getIcon = (value) =>{

        if(value > 0){
            return "/images/up.png";
        }else if(value < 0){
            return "/images/down.png";
        }

        return "/images/nochange.png";
        
    }

    const getPlayerPosition = (playerId) =>{

        if(state.currentPositions[playerId] !== undefined){

            const pos = state.currentPositions[playerId];
            return `${pos}${Functions.getOrdinal(pos)}`
        }

        return -1;
    }

    const getPlayerMatchChanges = (playerId) =>{

        for(let i = 0; i < state.matchChanges.length; i++){

            const m = state.matchChanges[i];

            if(m.player_id === playerId) return m;
        }

        return null;
    }

    const getRankingChangeString = (value) =>{

        if(value > 0){
            return <>Player gained <b>{value.toFixed(2)}</b> ranking points.</>
        }

        if(value < 0){
            return <>Player lost <b>{Math.abs(value).toFixed(2)}</b> ranking points.</>
        }

        return <>There was no change to the player&apos;s rankings score.</>;
    }

    const renderRankings = () =>{

        const headers = {
            "player": "Player",
            "previous": "Previous Ranking",
            "after": "Ranking After Match",
            "match": "Match Ranking",
            "current": "Current Ranking"
        };

        const data = [];

        for(let i = 0; i < state.currentRankings.length; i++){

            const c = state.currentRankings[i];

            const player = Functions.getPlayer(players, c.player_id, true);

            const currentIcon = getIcon(c.ranking_change);

            const matchChange = getPlayerMatchChanges(c.player_id);

            if(matchChange === null){
                console.log(`MatchChange data is null.`);
                continue;
            }

            const diff = matchChange.ranking - matchChange.ranking_change;

            const previousRanking = matchChange.ranking - diff;

            const diffIcon = getIcon(diff);
            const previousIcon = getIcon(previousRanking - matchChange.ranking);
            
            data.push({
                "player": {
                    "value": player.name.toLowerCase(),
                    "displayValue": <Link href={`/pmatch/${matchId}/?player=${player.id}`}>
                        
                            <CountryFlag country={player.country}/>{player.name}
                        
                    </Link>,
                    "className": `player ${Functions.getTeamColor(player.team)}`
                },
                "previous": {
                    "value": previousRanking,
                    "displayValue": <><img className="ranking-icon" src={previousIcon} alt="image"/>{previousRanking.toFixed(2)}</>
                },
                "after": {
                    "value": matchChange.ranking, 
                    "displayValue": <MouseOver title="Player Latest Ranking Change" display={getRankingChangeString(diff)}>
                        <img className="ranking-icon" src={diffIcon} alt="image"/>
                        {matchChange.ranking.toFixed(2)}
                    </MouseOver>
                },
                "match": {
                    "value": matchChange.match_ranking, 
                    "displayValue": matchChange.match_ranking.toFixed(2)
                },
                "current": {
                    "value": c.ranking, 
                    "displayValue": <MouseOver title="Player Latest Ranking Change" display={getRankingChangeString(c.ranking_change)}>
                        <span className="ranking-position">{getPlayerPosition(c.player_id)}</span>
                        <img className="ranking-icon" src={currentIcon} alt="image"/>
                        {c.ranking.toFixed(2)}
                    </MouseOver>
                }
            });
        }

        return <InteractiveTable width={1} headers={headers} data={data}/>
    }


    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Match Ranking Changes" text={state.error}/>

    return <div>
        <div className="default-header">Match Ranking Changes</div>
        {renderRankings()}
    </div>
}

export default MatchRankingChanges;
