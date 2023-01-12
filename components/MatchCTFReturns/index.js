import {React, useEffect, useState} from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractiveTable from "../InteractiveTable";
import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";
import Link from "next/link";

/*class MatchCTFReturns extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        return <div>
            <div className="default-header">Capture The Flag Returns</div>
        </div>
    }
}*/


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



    function renderBasicTable(){

        if(returnData === null) return null;

        const headers = {
            "grab_time": "Grab Time",
            "return_time": "Return Time",
            "travel_time": "Travel Time",
            "time_dropped": "Time Dropped",
            "total_drops": "Times Dropped",
            "grab_player": "Grab Player",
            "return_player": "Return Player",
            "distance_to_cap": "Distance To Cap"
        };

        const data = [];

        for(let i = 0; i < returnData.length; i++){

            const r = returnData[i];

            const grabPlayer = Functions.getPlayer(props.playerData, r.grab_player);
            const returnPlayer = Functions.getPlayer(props.playerData, r.return_player);


            data.push({
                "grab_time": {"value": r.grab_time, "displayValue": Functions.MMSS(r.grab_time)},
                "return_time": {"value": r.return_time, "displayValue": Functions.MMSS(r.return_time)},
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
                    "displayValue": r.distance_to_cap.toFixed(2)
                }
            });
        }


        return <InteractiveTable width={1} headers={headers} data={data}/>
    }


    return <div>
        <div className="default-header">Capture The Flag Returns</div>
        {(bLoading) ? <Loading /> : null}
        {(error !== null) ? <ErrorMessage title="CTF Returns" text={error}/> : null }

        {renderBasicTable()}
    </div>
}

export default MatchCTFReturns;