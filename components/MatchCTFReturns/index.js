import {React, useEffect, useState} from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractiveTable from "../InteractiveTable";
import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import styles from "./MatchCTFReturns.module.css";
import MouseOver from "../MouseOver";
import MatchCTFReturnDetailed from "../MatchCTFReturnDetailed";

const MatchCTFReturns = (props) =>{

    const [returnData, setReturnData] = useState(null);
    const [bLoading, setbLoading] = useState(true);
    const [error, setError] = useState(null);
    const [displayMode, setDisplayMode] = useState(0);

    useEffect(() =>{

        const controller = new AbortController();
        const signal = controller.signal;
    
        async function loadData(){
            
            if(props.matchId !== undefined){

                try{
            
                    const req = await fetch("/api/ctf", {
                        "signal": signal,
                        "headers": {"Content-Type": "application/json"},
                        "method": "POST",
                        "body": JSON.stringify({"mode": "match-returns", "matchId": props.matchId})
                    });
        
                    const res = await req.json();
                    
                    if(res.error !== undefined){
                        setError(res.error.toString());
                    }else{
                        setReturnData(res.data);
                        setbLoading(false);
                    }
    
                }catch(err){
    
                    setbLoading(false);
    
                    if(err.name !== "AbortError"){
                        setError(err.toString());         
                    }
                }     
            }
        }

        loadData();
        
        //clean up function
        return () => {
            //cancel any pending requests
            controller.abort();
        }
    }, [props.matchId]);


    function getSmartCTFString(string){

        const reg = /^return_(.+)$/i;

        const result = reg.exec(string);

        if(result === null) return string;

        const remaining = result[1];

        if(remaining === "closesave"){
            return "Close Save";
        }else if(remaining === "mid"){
            return "Middle";
        }else if(remaining === "base"){
            return "Home Base";
        }else if(remaining === "enemybase"){
            return "Enemy Base";
        }

        return string;
    }

    const createHoverData = (data, playerKey) =>{

        if(data.length === 0) return null;

        const unique = {};

        for(let i = 0; i < data.length; i++){

            const c = data[i];

            if(unique[c[playerKey]] === undefined){
                unique[c[playerKey]] = 0;
            }

            unique[c[playerKey]]++;
        }

        const elems = [];

        let index = 0;

        const totalUnique = Object.keys(unique).length;

        for(const [playerId, totalCovers] of Object.entries(unique)){

            const player = Functions.getPlayer(props.playerData, playerId);

            elems.push(<div key={playerId} className={styles.player}>
                <CountryFlag country={player.country}/>{player.name} <b>{totalCovers}</b>
                {(index < totalUnique - 1) ? ", " : ""}
            </div>);

            index++;
        }

        return <div>
            {elems}
        </div>
    }


    const renderBasicTable = () =>{

        if(displayMode !== 0) return null;

        if(returnData === null) return null;

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

            const grabPlayer = Functions.getPlayer(props.playerData, r.grab_player);
            const returnPlayer = Functions.getPlayer(props.playerData, r.return_player);

            let smartCTFString = getSmartCTFString(r.return_string);

            let suicideElem = null;

            if(r.total_suicides > 0){
                suicideElem = <span className={styles["smart-ctf-string"]}>
                    ({r.total_suicides} {Functions.plural(r.total_suicides,"Suicide")})
                </span>;
            }

            data.push({
                "grab_time": {
                    "value": r.grab_time, 
                    "displayValue": Functions.MMSS(r.grab_time - props.matchStart)
                },
                "return_time": {"value": r.return_time, "displayValue": Functions.MMSS(r.return_time - props.matchStart)},
                "travel_time": {"value": r.travel_time, "displayValue": Functions.toPlaytime(r.travel_time), "className": "playtime"},
                "time_dropped": {"value": r.drop_time, "displayValue": Functions.toPlaytime(r.drop_time), "className": "playtime"},
                "total_drops": {
                    "value": r.total_drops, 
                    "displayValue": <MouseOver title="Flag Drops" display={createHoverData(r.flagDrops, "player_id")}>{r.total_drops}</MouseOver>},
                "grab_player": {
                    "value": grabPlayer.name.toLowerCase(), 
                    "displayValue": <Link href={`/pmatch/${props.matchId}/?player=${grabPlayer.id}`}>
                        <a>
                            <CountryFlag country={grabPlayer.country}/>{grabPlayer.name}
                        </a>
                    </Link>,
                    "className": Functions.getTeamColor(grabPlayer.team)
                },
                "return_player": {
                    "value": returnPlayer.name.toLowerCase(), 
                    "displayValue": <Link href={`/pmatch/${props.matchId}/?player=${returnPlayer.id}`}>
                        <a>
                            <CountryFlag country={returnPlayer.country}/>{returnPlayer.name}
                        </a>
                    </Link>,
                    "className": Functions.getTeamColor(returnPlayer.team)
                },
                "distance_to_cap": {
                    "value": r.distance_to_cap,
                    "displayValue": <>{r.distance_to_cap.toFixed(2)} <span className={styles["smart-ctf-string"]}>({smartCTFString})</span></>
                },
                "total_deaths": {
                    "value": r.total_deaths,
                    "displayValue": <MouseOver title="Deaths With Flag" display={createHoverData(r.deathsData, "victim_id")}>
                        {Functions.ignore0(r.total_deaths)} {suicideElem}
                    </MouseOver>
                 
                },
                "total_pickups": {
                    "value": r.total_pickups, 
                    "displayValue": <MouseOver title="Flag Pickups" display={createHoverData(r.flagPickups, "player_id")}>
                        {Functions.ignore0(r.total_pickups)}
                    </MouseOver>
                },
                "total_covers": {
                    "value": r.total_covers, 
                    "displayValue": <MouseOver title="Flag Covers" display={createHoverData(r.coverData, "killer_id")}>
                    <>{Functions.ignore0(r.total_covers)}</>
                </MouseOver>
                },
                "total_self_covers": {
                    "value": r.total_self_covers, 
                    "displayValue": <MouseOver title="Self Covers (Kills carrying flag)" display={createHoverData(r.selfCoverData, "killer_id")}>
                    <>{Functions.ignore0(r.total_self_covers)}</>
                </MouseOver>
                },

            });
        }

        return <InteractiveTable width={1} headers={headers} data={data} perPage={10}/>
    }

    const renderDetailed = () =>{

        if(displayMode !== 1) return null;

        if(returnData === null) return null;

        const elems = [];

        for(let i = 0; i < returnData.length; i++){

            const r = returnData[i];

            elems.push(<MatchCTFReturnDetailed 
                key={r.id} 
                data={r} 
                playerData={props.playerData}
                smartCTFString={getSmartCTFString(r.return_string)}
                matchId={props.matchId}
                matchStart={props.matchStart}
            />);

        }

        return elems;
    }

    return <div>
        <div className="default-header">Capture The Flag Returns</div>
        {(bLoading) ? <Loading /> : null}
        {(error !== null) ? <ErrorMessage title="CTF Returns" text={error}/> : null }
        {renderBasicTable()}
        {renderDetailed()}
    </div>
}

export default MatchCTFReturns;