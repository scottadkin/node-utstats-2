import {React, useState, useEffect} from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import styles from"./MatchKillsMatchUp.module.css";
import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";
import Table2 from "../Table2";
import Link from "next/link";

const MatchKillsMatchUp = ({matchId, players}) =>{

    const [bLoading, setbLoading] = useState(true);
    const [killData, setKillData] = useState(null);
    const [error, setError] = useState(null);


    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            const req = await fetch("/api/match",{
                "signal": controller.signal,
                "headers": {
                    "Content-type": "application/json"
                },
                "method": "POST",
                "body": JSON.stringify({"mode": "kmu", "matchId": matchId})
            });

            const res = await req.json();

            if(res.error !== undefined){
                setError(res.error);
            }else{
                setKillData(res.data);
            }

            setbLoading(false);


        }

        loadData();

        return () =>{
            controller.abort();
        }

    }, [matchId]);


    const getKills = (killer, victim) =>{

        for(let i = 0; i < killData.length; i++){

            const d = killData[i];

            if(d.killer === killer && d.victim === victim){
                return d.kills;
            }
        }

        return 0;
    }


    const renderTable = () =>{

        const headers = [];

        const orderedPlayers = [...Object.values(players)];

        orderedPlayers.sort((a, b) =>{

            if(a.team > b.team) return -1;
            if(a.team < b.team) return 1;

            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();

            if(aName > bName) return -1;
            if(aName < bName) return 1;
            return 0;
            
        });

        for(let i = 0; i < orderedPlayers.length; i++){

            const player = orderedPlayers[i];

            if(player.spectator || !player.played) continue;

            headers.push(<th key={player.id} className={`${styles.th} text-left ${Functions.getTeamColor(player.team)}`}>
                <Link href={`/pmatch/${matchId}/?player=${player.id}`}>
                    
                        <img className={styles.flag} src={`/images/flags/${player.country}.svg`} alt="flag"/>
                        &nbsp;&nbsp;{player.name}
                    
                </Link>
            </th>);

        }


        const rows = [];


        for(let i = 0; i < orderedPlayers.length; i++){

            const killer = orderedPlayers[i];

            if(killer.spectator || !killer.played) continue;

            const columns = [];

            for(let x = 0; x < orderedPlayers.length; x++){
                const victim = orderedPlayers[x];

                if(victim.spectator || !victim.played) continue;

                const totalKills = Functions.ignore0(getKills(killer.id, victim.id));

                const key = `km-${i}-${x}`;

                if(killer.id === victim.id){
                    columns.push(<td key={key} className="color3">{totalKills}</td>);
                }else{
                    columns.push(<td key={key}>{totalKills}</td>);
                }

            }

            rows.push(<tr key={i}>
                <td className={`${Functions.getTeamColor(killer.team)} text-left`}><CountryFlag country={killer.country}/>{killer.name}</td>
                {columns}
            </tr>);
        }


        return <table>
            <tbody>
            <tr>
                <th>&nbsp;</th>
                {headers}
            </tr>
            {rows}
            </tbody>
        </table>
    }

    if(bLoading) return <Loading />;

    if(killData.length === 0) return null;

    return <div>
        <div className="default-header">Kills Match Up</div>
        {renderTable()}
    </div>
}

export default MatchKillsMatchUp;
