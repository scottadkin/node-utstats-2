"use client"
import {useState} from "react";
import InteractiveTable from "../InteractiveTable";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import styles from "./MatchCTFReturns.module.css";
import MouseOver from "../../../../components/MouseOver";
import MatchCTFReturnDetailed from "./MatchCTFReturnDetailed";
import { getPlayerFromMatchData, MMSS, toPlaytime, plural, getTeamColor, 
    scalePlaytime, ignore0, getTeamName, getSmartCTFReturnString } from "../../../../api/generic.mjs";


function createFragHoverData(targetTimestamp, teamId, data, playerData){

    const cleanData = data.filter((current) =>{
        if(current.player_team === teamId) return true;
    });

    cleanData.sort((a, b) =>{

        a = a.total_events;
        b = b.total_events;

        if(a < b) return 1;
        if(a > b) return -1;
        return 0;
    });

    const elems = [];

    for(let i = 0; i < cleanData.length; i++){

        const d = cleanData[i];
        const player = getPlayerFromMatchData(playerData, d.player_id);

        elems.push(<span key={i}>
            <CountryFlag country={player.country}/>{player.name} <b>{d.total_events}</b>{(i < cleanData.length - 1) ? ", " : null}
        </span>);

    }

    return <div>
        {elems}
    </div>
}

function createHoverData(data, playerKey, playerData){

    if(data.length === 0) return null;

    const unique = {};

    for(let i = 0; i < data.length; i++){

        const c = data[i];

        if(unique[c[playerKey]] === undefined){
            unique[c[playerKey]] = 0;
        }

        unique[c[playerKey]]++;
    }

    const totals = Object.entries(unique);

    totals.sort((a, b) =>{

        a = a[1];
        b = b[1];

        if(a < b) return 1;
        if(a > b) return -1;
        return 0;

    });

    const elems = [];

   // console.log(totals);

    for(let i = 0; i < totals.length; i++){

        const t = totals[i];

        const player = getPlayerFromMatchData(playerData, t[0]);

        elems.push(<div key={t[0]} className={styles.player}>
            <CountryFlag country={player.country}/>{player.name} <b>{t[1]}</b>
            {(i < totals.length - 1) ? ", " : ""}
        </div>);

    }

    return <div>{elems}</div>;
}

function renderDetailed(displayMode, displayData, returnData, playerData, matchId, matchStart){

    if(displayMode !== 1) return null;

    if(returnData === null) return null;

    const elems = [];

    for(let i = 0; i < returnData.length; i++){

        const r = returnData[i];

        elems.push(<MatchCTFReturnDetailed 
            key={r.id} 
            data={r} 
            playerData={playerData}
            smartCTFString={getSmartCTFString(r.return_string)}
            matchId={matchId}
            matchStart={matchStart}
        />);

    }

    return elems;
}

function getGeneralData(returnData, playerData, matchId, matchStart, bHardcore){

    const headers = {
        "grab_time": "Grabbed",
        "return_time": "Returned",
        "travel_time": "Travel Time",
        "time_dropped": "Dropped Time",
        "total_drops": "Drops",
        "total_deaths": "Deaths",
        "total_pickups": "Pickups",
        "total_covers": "Covers",
        "total_self_covers": "Self Covers",
        "grab_player": "Grab Player",
        "return_player": "Return Player",
        "distance_to_cap": "Distance To Cap",
    };

    const data = [];

    for(let i = 0; i < returnData.length; i++){

        const r = returnData[i];

        const grabPlayer = getPlayerFromMatchData(playerData, r.grab_player);
        const returnPlayer = getPlayerFromMatchData(playerData, r.return_player);

        let returnPlayerElem = <div>Timed Out Return</div>

        if(r.return_player !== -1){
            returnPlayerElem = <Link href={`/pmatch/${matchId}/?player=${returnPlayer.id}`}>
                
                <CountryFlag country={returnPlayer.country}/>{returnPlayer.name}
                
            </Link>
        }

        let smartCTFString = getSmartCTFReturnString(r.return_string);

        let suicideElem = null;

        if(r.total_suicides > 0){
            suicideElem = <span className={styles["smart-ctf-string"]}>
                ({r.total_suicides} {plural(r.total_suicides,"Suicide")})
            </span>;
        }

        //scalePlaytime(playtime, bHardcore)
        const grabTime = scalePlaytime(r.grab_time - matchStart, bHardcore);
        const returnTime = scalePlaytime(r.return_time - matchStart, bHardcore);
        const travelTime = scalePlaytime(r.travel_time, bHardcore);
        const dropTime = scalePlaytime(r.drop_time, bHardcore);

        data.push({
            "grab_time": {
                "value": grabTime, 
                "displayValue": MMSS(grabTime)
            },
            "return_time": {"value": returnTime, "displayValue": MMSS(returnTime)},
            "travel_time": {"value": travelTime, "displayValue": toPlaytime(travelTime), "className": "playtime"},
            "time_dropped": {"value": dropTime, "displayValue": toPlaytime(dropTime), "className": "playtime"},
            "total_drops": {
                "value": r.total_drops, 
                "displayValue": <MouseOver title="Flag Drops" display={createHoverData(r.flagDrops, "player_id", playerData)}>{r.total_drops}</MouseOver>},
            "grab_player": {
                "value": grabPlayer.name.toLowerCase(), 
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${grabPlayer.id}`}>
                    
                        <CountryFlag country={grabPlayer.country}/>{grabPlayer.name}
                    
                </Link>,
                "className": getTeamColor(grabPlayer.team)
            },
            "return_player": {
                "value": returnPlayer.name.toLowerCase(), 
                "displayValue": returnPlayerElem,
                "className": (r.return_player === -1) ? "black" : getTeamColor(returnPlayer.team)
            },
            "distance_to_cap": {
                "value": r.distance_to_cap,
                "displayValue": <>{r.distance_to_cap.toFixed(2)} <span className={styles["smart-ctf-string"]}>({smartCTFString})</span></>
            },
            "total_deaths": {
                "value": r.total_deaths,
                "displayValue": <MouseOver title="Deaths With Flag" display={createHoverData(r.deathsData, "victim_id", playerData)}>
                    {ignore0(r.total_deaths)} {suicideElem}
                </MouseOver>
                
            },
            "total_pickups": {
                "value": r.total_pickups, 
                "displayValue": <MouseOver title="Flag Pickups" display={createHoverData(r.flagPickups, "player_id", playerData)}>
                    {ignore0(r.total_pickups)}
                </MouseOver>
            },
            "total_covers": {
                "value": r.total_covers, 
                "displayValue": <MouseOver title="Flag Covers" display={createHoverData(r.coverData, "killer_id", playerData)}>
                <>{ignore0(r.total_covers)}</>
            </MouseOver>
            },
            "total_self_covers": {
                "value": r.total_self_covers, 
                "displayValue": <MouseOver title="Self Covers (Kills carrying flag)" display={createHoverData(r.selfCoverData, "killer_id", playerData)}>
                <>{ignore0(r.total_self_covers)}</>
            </MouseOver>
            },

        });
    }

    return {"headers": headers, "data": data};
}

function getFragData(returnData, totalTeams, bHardcore, matchStart, playerData){


    const headers = {
        "info": "Flag",
        "grab": "Grabbed",
        "returned": "Returned",
    };

    for(let i = 0; i < totalTeams; i++){

        headers[`team_${i}_kills`] = `${getTeamName(i, true)} Kills`;
        headers[`team_${i}_suicides`] = `${getTeamName(i, true)} Suicides`;
    }

    const data = returnData.map((currentReturn) =>{

        const grabTime = scalePlaytime(currentReturn.grab_time - matchStart, bHardcore);
        const returnTime = scalePlaytime(currentReturn.return_time - matchStart, bHardcore);
        const flagTeam = currentReturn.flag_team;

        const returnObject = {
            "info": {
                "value": flagTeam,
                "displayValue": `${getTeamName(flagTeam, true)} Flag`,
                "className": getTeamColor(flagTeam) 
            },
            "grab": {
                "value": grabTime, 
                "displayValue": MMSS(grabTime)
            },
            "returned": {
                "value": returnTime, 
                "displayValue": MMSS(returnTime)
            },
        };

        for(let i = 0; i < totalTeams; i++){

            returnObject[`team_${i}_kills`] = {
                "value": currentReturn[`team_${i}_kills`],
                "displayValue": <MouseOver title="Kills" display={createFragHoverData(returnTime, i, currentReturn.returnKills, playerData)}>
                    {ignore0(currentReturn[`team_${i}_kills`])}
                </MouseOver>
            };

            returnObject[`team_${i}_suicides`] = {
                "value": currentReturn[`team_${i}_suicides`],
                "displayValue": <MouseOver title="Suicides" display={createFragHoverData(returnTime, i, currentReturn.returnSuicides, playerData)}>
                    {ignore0(currentReturn[`team_${i}_suicides`])}
                </MouseOver>
            };
        }

        return returnObject;
    });

    return {"data": data, "headers": headers};
}

function renderBasicTable(displayMode, currentTab, returnData, playerData, matchId, matchStart, bHardcore, totalTeams){

    if(displayMode !== 0) return null;

    if(returnData === null) return null;

    let headers = {};
    let data = [];

    if(currentTab === 0){
        
        const generalData = getGeneralData(returnData, playerData, matchId, matchStart, bHardcore);

        headers = generalData.headers;
        data = generalData.data;
    }

    if(currentTab === 1){

        const fragData = getFragData(returnData, totalTeams, bHardcore, matchStart, playerData);

        headers = fragData.headers;
        data = fragData.data;
    }

    return <InteractiveTable width={1} headers={headers} data={data} perPage={10}/>
}

export default function MatchCTFReturns({playerData, returnData, matchId, matchStart, single, bHardcore, totalTeams}){

    const [displayMode, setDisplayMode] = useState(0);
    const [currentTab, setCurrentTab] = useState(0);

    return <div>
        <div className="default-header">Capture The Flag Returns</div>
        <div className="tabs">
            <div className={`tab ${(currentTab === 0) ? "tab-selected" : ""}`} onClick={() =>{
                setCurrentTab(0);
            }}>
                General
            </div>
            <div className={`tab ${(currentTab === 1) ? "tab-selected" : ""}`} onClick={() =>{
                setCurrentTab(1);
            }}>
                Team Frags
            </div>
        </div>
        {renderBasicTable(displayMode, currentTab, returnData, playerData, matchId, matchStart, bHardcore, totalTeams)}
    </div>
}