import {React, useEffect, useState} from 'react';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';
import InteractiveTable from '../../src/app/UI/InteractiveTable';

const MatchSprees = ({matchId, players, matchStart}) =>{


    const [bLoading, setbLoading] = useState(true);
    const [sprees, setSprees] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            try{

                const req = await fetch("/api/match",{
                    "signal": controller.signal,
                    "headers": {
                        "Content-type": "application/json",
                    },
                    "method": "post",
                    "body": JSON.stringify({
                        "mode": "sprees",
                        "matchId": matchId
                    })
                });

                const res = await req.json();

                if(res.error !== undefined){
                    setError(res.error);
                }else{
                    setSprees(res.data);
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

    },[matchId]);


    const renderTable = () =>{

        const headers = {
            "player": "Player",
            "started": "Started",
            "ended": "Ended",
            "spreeTime": "Spree Lifetime",
            "reason": "End Reason",
            "kills": "Total Kills"
       
        };
        const data =[];

        for(let i = 0; i < sprees.length; i++){

            const s = sprees[i];

            const player = Functions.getPlayer(players, s.player, true);

            let endReason = null;

            if(s.killer === -1){
                endReason = <div>Match ended!</div>;
            }

            if(s.killer !== -1 && s.player !== s.killer){

                const killer = Functions.getPlayer(players, s.killer, true);
                endReason = <div><span className="red">Killed by</span> <CountryFlag country={killer.country}/>{killer.name}</div>
            }

            if(s.killer === s.player){
                endReason = <div className="red">Committed Suicide</div>
            }

            data.push({
                "player": {
                    "value": player.name.toLowerCase(), 
                    "displayValue": <Link href={`/pmatch/${matchId}/?player=${player.id}`}>
                        
                            <CountryFlag country={player.country}/>{player.name}
                        
                    </Link>,
                    "className": `player ${Functions.getTeamColor(player.team)}`
                },
                "started": {"value": s.start_timestamp, "displayValue": Functions.MMSS(s.start_timestamp - matchStart)},
                "ended": {"value": s.end_timestamp, "displayValue": Functions.MMSS(s.end_timestamp - matchStart)},
                "spreeTime": {
                    "value": s.total_time,
                    "displayValue": Functions.toPlaytime(s.total_time),
                    "className": "playtime"
                },
                "reason": {"value": s.killer, "displayValue": endReason},
                "kills": {"value": s.kills}
            });
        }

        return <InteractiveTable width={1} headers={headers} data={data}/>;
    }


    if(bLoading) return <Loading />;
    if(error !== null) return <ErrorMessage title="Extended Spree Summary" text={error}/>;

    if(sprees !== null){
        if(sprees.length === 0) return null;
    }

    return <div>
        <div className="default-header">Extended Spree Summary</div>
        {renderTable()}
    </div>
}

export default MatchSprees;
