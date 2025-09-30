"use client"

import {useEffect, useReducer} from "react";
import Loading from "../Loading";
import ErrorMessage from "../../../../components/ErrorMessage";
import InteractiveTable from "../../../../components/InteractiveTable";
import { getPlayer, convertTimestamp, toPlaytime } from "../../../../api/generic.mjs";
import Link from "next/link";
import CountryFlag from "../CountryFlag";
import Pagination from "../Pagination";
import Tabs from "../Tabs";

const reducer = (state, action) =>{

    switch(action.type){
        case "loading": {
            return {
                ...state,
                "bLoading": true,
                "caps": null,
                "players": null,
                "totalCaps": 0,
            }
        }
        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "error": null,
                "caps": action.caps,
                "players": action.players,
                "totalCaps": action.totalCaps,
                
            };
        }
        case "error": {
            return {
                ...state,
                "bLoading": false,
                "error": action.errorMessage,
                
            }
        }
        case "set-mode": {
            return {
                ...state,
                "mode": action.value,
                "page": 1
            }
        }
        case "set-page": {
            return {
                ...state,
                "page": action.value
            }
        }
    }

    return state;
}


const createAssistedPlayers = (assists, players, ignorePlayers, matchId, capId) =>{


    if(assists === undefined) return [];

    if(assists[capId] === undefined) return [];

    //return null;
    const playerList = [];

    for(let i = 0; i < assists[capId].length; i++){

        const playerId = assists[capId][i];

        if(ignorePlayers.indexOf(playerId) !== -1) continue;
        const player = getPlayer(players, playerId, true);

        playerList.push(player);
    }


    const elems = [];

    for(let i = 0; i < playerList.length; i++){

        const p = playerList[i];

        elems.push(<Link key={p.id} href={`/pmatch/${matchId}/?player=${p.id}`}>
            <span className="small-font grey">
                <CountryFlag country={p.country}/>{p.name}{(i < playerList.length - 1) ? ", " : ""}
            </span>
        </Link>);
    }

    return elems;
}

const getHeaders = (mode) =>{

    if(mode === 1){
        return {
            "date": "Date",
            "grab": "Grabbed By",
            "assists": "Assisted By",
            "cap": "Capped By",
            "carry": "Carry Time",
            "drop": "Time Dropped",
            "travel": "Travel Time"
        };
    }

    return {
        "date": "Date",
        "cap": "Capped By",
        "carry": "Carry Time",
        "drop": "Time Dropped",
        "travel": "Travel Time"
    };
}

const renderCaps = (currentMode, caps, players, mapId, totalCaps, perPage, currentPage, dispatch) =>{

    if(caps === null) return null;

    const headers = getHeaders(currentMode);

    const data = [];

    for(const [capId, capData] of Object.entries(caps.caps)){


        const grabPlayer = getPlayer(players, capData.grab_player, true);
        const capPlayer = getPlayer(players, capData.cap_player, true);

        const ignorePlayers = [capData.grab_player, capData.cap_player];

        let assistElems = [];

        if(currentMode === 1){
            assistElems = createAssistedPlayers(caps.assistData, players, ignorePlayers, capData.match_id, capId);  
        }

        const current = {
            "date": {
                "value": capData.match_date, 
                "displayValue": <Link href={`/match/${capData.match_id}`}>
                   
                    {convertTimestamp(capData.match_date, true)}
                    
                </Link>,
                "className": "playtime"
            },
            "cap": {
                "value": capPlayer.name.toLowerCase(),
                "displayValue": <Link href={`/pmatch/${capData.match_id}/?player=${capData.cap_player}`}>
                    
                    <CountryFlag country={capPlayer.country}/>{capPlayer.name}
                    
                </Link>
            },
            "carry": {"value": capData.carry_time, "displayValue": toPlaytime(capData.carry_time, true), "className": "playtime"},
            "drop": {"value": capData.drop_time, "displayValue": toPlaytime(capData.drop_time, true), "className": "playtime"},
            "travel": {"value": capData.travel_time, "displayValue": toPlaytime(capData.travel_time, true), "className": "playtime"}
        }

        if(currentMode === 1){

            current.grab = {
                "value": grabPlayer.name.toLowerCase(),
                "displayValue": <Link href={`/pmatch/${capData.match_id}/?player=${capData.grab_player}`}>
                    
                        <CountryFlag country={grabPlayer.country}/>{grabPlayer.name}
                    
                </Link>
            };
            current.assists = {
                "value": assistElems.length,
                "displayValue": assistElems
            }
        }

        data.push(current);
    }

    if(data.length === 0) return <div className="no-data">No Data Found</div>;

    return <>
        <InteractiveTable width={1} headers={headers} data={data} defaultOrder={"travel"} bDisableSorting={true}/>
        <Pagination url={null} results={totalCaps} currentPage={currentPage } perPage={perPage} anchor="#caps" event={(e) =>{
            dispatch({"type": "set-page", "value": e});
        }} />
    </>
}

const renderElems = (mode, state, mapId, page, perPage, dispatch) =>{

    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Capture The Flag Cap Records" text={state.error} />


    return renderCaps(mode, state.caps, state.players, mapId, state.totalCaps, perPage, page, dispatch);
}

async function loadData(mapId, mode, page, perPage, dispatch, controller){

    const capMode = mode;//(mode === 0) ? "solo" : "assist";

    try{

        const body = {
            "mode": "map-caps", 
            "mapId": mapId, 
            "perPage": perPage, 
            "page": page,
            "capType": capMode,
        };

        const req = await fetch("/api/ctf", {
            "signal": controller.signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify(body)
        });

        const res = await req.json();

        if(res.error !== undefined){
            dispatch({"type": "error", "errorMessage": res.error});
            return;
        }
        
        dispatch({"type": "loaded", "caps": res.caps, "players": res.players, "totalCaps": res.totalCaps});

    }catch(err){

        if(err.name === "AbortError") return;
        dispatch({"type": "error", "errorMessage": err.toString()});
    }
    
}

export default function MapCTFCaps({mapId, perPage, mode}){

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "caps": null,
        "players": null,
        "totalCaps": 0,
        "mode": mode,
        "perPage": perPage,
        "page": 1
    });

    useEffect(() =>{

        dispatch({"type": "loading"});
        const controller = new AbortController();

        loadData(mapId, state.mode, state.page, state.perPage, dispatch, controller);

        return () =>{
            controller.abort();
        }

    }, [mapId, state.page, state.perPage, state.mode]);

    const tabsOptions = [
        {"value": "solo", "name": "Solo Caps"},
        {"value": "assist", "name": "Assisted Caps"},
    ];

    return <div id="caps">
        <div className="default-header">Capture The Flag Cap Records</div>  
        <Tabs options={tabsOptions} selectedValue={state.mode} changeSelected={(v) =>{
            dispatch({"type": "set-mode", "value": v});
        }}/>
        {renderElems(state.mode, state, mapId, state.page, state.perPage, dispatch)}
    </div>
}
