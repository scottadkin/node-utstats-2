import {React, useEffect, useState} from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractiveTable from "../InteractiveTable";
import Link from "next/link";
import CountryFlag from "../CountryFlag";
import Functions from "../../api/functions";


const MatchCTFCarryTime = ({matchId, players}) =>{

    const [bLoading, setbLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            try{
                const req = await fetch("/api/ctf", {
                    "signal": controller.signal,
                    "headers": {"Content-type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"mode": "carrytime", "matchId": matchId})
                });
        
                const res = await req.json();

                if(res.error !== undefined){
                    setError(res.error);   
                }else{
                    setData(res.data);
                    setError(null);
                }

                setbLoading(false);
            }catch(err){

                if(err.name !== "AbortError"){
                    setError(err.toString()); 
                }
            }
        }

        loadData();

        return () =>{
            controller.abort();
        }

    }, [matchId]);


    const renderTable = () =>{

        if(data === null) return null;

        const headers = {
            "player": "Player",
            "assists": "Assists",
            "best_assist": "Most Assists(Single Life)",
            "caps": "Caps",
            "best_caps": "Most Caps(Single Life)",
            "total_carry_time": "Total Carry Time",
            "best_carry_time_life": "Best Carry Time(Single Life)"
        };

        
        const filtered = data.filter((playerInfo) =>{
            if(playerInfo.playtime > 0) return true;
        });

        const rows = filtered.map((carryData) =>{

            const player = Functions.getPlayer(players, carryData.player_id, true);
            
            return {
                "player": {
                    "value": player.name.toLowerCase(), 
                    "displayValue": <Link href={`/pmatch/${matchId}/?player=${player.id}`}>
                        
                        <CountryFlag country={player.country}/>{player.name}
                        
                    </Link>,
                    "className": `text-left ${Functions.getTeamColor(player.team)}`
                },
                "assists": {
                    "value": carryData.flag_assist,
                    "displayValue": Functions.ignore0(carryData.flag_assist)
                },
                "best_assist": {
                    "value": carryData.flag_assist_best,
                    "displayValue": Functions.ignore0(carryData.flag_assist_best)
                },
                "caps": {
                    "value": carryData.flag_capture,
                    "displayValue": Functions.ignore0(carryData.flag_capture)
                },
                "best_caps": {
                    "value": carryData.flag_capture_best,
                    "displayValue": Functions.ignore0(carryData.flag_capture_best)
                },
                "total_carry_time": {
                    "value": carryData.flag_carry_time,
                    "displayValue": Functions.toPlaytime(carryData.flag_carry_time),
                    "className": "playtime"
                },
                "best_carry_time_life": {
                    "value": carryData.flag_carry_time_best,
                    "displayValue": Functions.toPlaytime(carryData.flag_carry_time_best),
                    "className": "playtime"
                }
            };
        });


        return <InteractiveTable width={1} headers={headers} data={rows}/>
    }


    if(bLoading) return <Loading />;
    if(error !== null) return <ErrorMessage title="Captrue The Flag Carry Times" text={error}/>


    return <div>
        <div className="default-header">Capture The Flag Carry Times</div>
        {renderTable()}
    </div>
}

export default MatchCTFCarryTime;