import {React, useEffect, useState} from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractiveTable from "../InteractiveTable";
import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import styles from "./MatchCTFReturns.module.css";
import MouseOver from "../MouseOver";
import Table2 from "../Table2";

const MatchCTFReturns = (props) =>{

    const [returnData, setReturnData] = useState(null);
    const [bLoading, setbLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const createCoversData = (covers) =>{

        if(covers.length === 0) return null;

        const rows = [];

        for(let i = 0; i < covers.length; i++){

            const c = covers[i];

            const killer = Functions.getPlayer(props.playerData, c.killer_id);
            const victim = Functions.getPlayer(props.playerData, c.victim_id);

            rows.push(<tr key={c.id}>
                <td className="playtime">{Functions.MMSS(c.timestamp - props.matchStart)}</td>
                <td><CountryFlag country={killer.country}/>{killer.name}</td>
                <td>Killed</td>
                <td><CountryFlag country={victim.country}/>{victim.name}</td>
            </tr>);

        }

        return <Table2 width={0} noBottomMargin={true}>
            {rows}
        </Table2>
    }

    function renderBasicTable(){

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

            console.log(r.total_self_covers, r.selfCoverData);

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
                    "displayValue": `${Functions.MMSS(r.grab_time - props.matchStart)} unfixed=${r.grab_time}`
                },
                "return_time": {"value": r.return_time, "displayValue": `${Functions.MMSS(r.return_time - props.matchStart)} unfixed=${r.return_time}`},
                "travel_time": {"value": r.travel_time, "displayValue": Functions.toPlaytime(r.travel_time), "className": "playtime"},
                "time_dropped": {"value": r.drop_time, "displayValue": Functions.toPlaytime(r.drop_time), "className": "playtime"},
                "total_drops": {"value": r.total_drops, "displayValue": r.total_drops},
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
                    "displayValue": <>{Functions.ignore0(r.total_deaths)} {suicideElem}</>
                 
                },
                "total_pickups": {"value": r.total_pickups, "displayValue": Functions.ignore0(r.total_pickups)},
                "total_covers": {
                    "value": r.total_covers, 
                    "displayValue": <MouseOver title="Covers" display={createCoversData(r.coverData)}>
                    <>{Functions.ignore0(r.total_covers)}</>
                </MouseOver>
                },
                "total_self_covers": {
                    "value": r.total_self_covers, 
                    "displayValue": <MouseOver title="Self Covers" display={createCoversData(r.selfCoverData)}>
                    <>{Functions.ignore0(r.total_self_covers)}</>
                </MouseOver>
                },

            });
        }


        return <InteractiveTable width={1} headers={headers} data={data} perPage={10}/>
    }


    return <div>
        <div className="default-header">Capture The Flag Returns</div>
        {(bLoading) ? <Loading /> : null}
        {(error !== null) ? <ErrorMessage title="CTF Returns" text={error}/> : null }

        {renderBasicTable()}
    </div>
}

export default MatchCTFReturns;