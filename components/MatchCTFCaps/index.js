import {React, useState, useEffect} from 'react';
import Functions from '../../api/functions';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';
import InteractiveTable from '../InteractiveTable';
import Link from 'next/link';
import CountryFlag from '../CountryFlag';
import MouseOver from "../MouseOver";


const MatchCTFCaps = ({matchId, playerData, totalTeams, matchStart}) =>{

    const [data, setData] = useState({});
    const [bLoading, setbLoading] = useState(true);
    const [error, setError] = useState(null);
    const [displayMode, setDisplayMode] = useState(0);

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            try{
                
                const req = await fetch("/api/ctf",{
                    "signal": controller.signal,
                    "headers": {"Content-type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"mode": "match-caps", "matchId": matchId})
                });
        
                const res = await req.json();

                if(res.error !== undefined){
                    setError(res.error.toString());
                }else{
                    setData(res);
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



    if(error !== null){
        return <ErrorMessage title="Match CTF Caps" text={error}/>;
    }

    if(bLoading){
        return <Loading />;
    }

    const teamScores = [];


    const updateTeamScores = (teamId) =>{

        if(teamScores.length === 0){

            for(let i = 0; i < totalTeams; i++){
                teamScores.push(0);
            }
        }

        teamScores[teamId]++;
    }

    const createTeamScoresString = () =>{

        let string = "";

        for(let i = 0; i < teamScores.length; i++){

            string += `${teamScores[i]}`;

            if(i < teamScores.length - 1){
                string += " - ";
            }
        }

        return string;
    }

    const createKillHoverData = (kills, teamId) =>{

        kills.sort((a, b) =>{

            a = a.total_events;
            b = b.total_events;

            if(a < b) return 1;
            if(a > b) return -1;
            return 0;
        });


        const found = kills.filter((kill) =>{
            if(kill.player_team === teamId) return true;
        });

        const elems = found.map((kill, index) =>{

            const player = Functions.getPlayer(playerData, kill.player_id, true);

            let end = null;

            if(index < found.length - 1){
                end = ", ";
            }

            return <span key={kill.player_id}>
                <CountryFlag country={player.country}/>{player.name} <b>{kill.total_events}</b>{end}
            </span>
            
        });


        if(elems.length === 0) return null;

        return <div>
            {elems}
        </div>;
    }



    const createTotalsHoverData = (data, targetKey, invalidTargetKeyValue, alternativeKey) =>{

        const totals = {};

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            let current = null;

            if(d[targetKey] === invalidTargetKeyValue){
                current = d[alternativeKey];
            }else{
                current = d[targetKey];
            }

            if(totals[current] === undefined){
                totals[current] = 0;
            }

            totals[current]++;
        }

        const finalData = Object.entries(totals);

        finalData.sort((a, b) =>{
            a = a[1];
            b = b[1];

            if(a < b) return 1;
            if(a > b) return -1;
            return 0;
        });

        const elems = [];

        for(let i = 0; i < finalData.length; i++){

            const d = finalData[i];

            const player = Functions.getPlayer(playerData, d[0], true);

            let end = "";

            if(i < finalData.length - 1){
                end = ", ";
            }

            elems.push(<span key={d[0]}>
                <CountryFlag country={player.country}/>{player.name} <b>{d[1]}</b>{end}
            </span>);
        }

        return <div>{elems}</div>
    }


    const createAssistHoverData = (assists) =>{

        const elems = assists.map((assist, index) =>{

            let end = "";

            if(index < assists.length - 1){
                end = `, `;
            }
            const player = Functions.getPlayer(playerData, assist.player_id, true);
            return <span key={assist.id}><CountryFlag country={player.country}/>{player.name} <b>{assist.carry_time} Secs</b>{end}</span>
        });

        return <div>{elems}</div>
    }


    const createTableData = () =>{

        if(data === undefined) return [];

        const rows = [];

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            updateTeamScores(d.cap_team);

            //const grabPlayer = Functions.getPlayer(playerData, d.grab_player);
            const capPlayer = Functions.getPlayer(playerData, d.cap_player, true);

            const suicideElem = (d.total_suicides === 0) ? null : 
            <span className="grey small-font">
                &nbsp;({d.total_suicides} {Functions.plural(d.total_suicides, "Suicide")})
            </span>

            const deathsElem = <>
                {Functions.ignore0(d.total_deaths)}
                {suicideElem}
            </>

            const currentRow = {
                "score": {
                    "value": i, 
                    "displayValue": createTeamScoresString(),
                    "className": Functions.getTeamColor(d.cap_team)
                },
                "cap": {
                    "value": d.cap_time,
                    "displayValue": Functions.MMSS(d.cap_time - matchStart)
                }
                
            };

            if(displayMode === 0){

               
                /*currentRow["taken"] = {
                    "value": d.grab_time,
                    "displayValue": Functions.MMSS(d.grab_time - matchStart)
                };*/

                /*currentRow["taken_player"] = {
                    "value": grabPlayer.name.toLowerCase(),
                    "displayValue": <>
                        <Link href={`/pmatch/${matchId}/?player=${grabPlayer.id}`}>
                            <a>
                                <CountryFlag country={grabPlayer.country}/>{grabPlayer.name}
                            </a>
                        </Link>
                    </>,
                    "className": Functions.getTeamColor(d.cap_team)
                };*/

                
                currentRow["cap_player"] = {
                    "value": capPlayer.name.toLowerCase(),
                    "displayValue": <>
                        <Link href={`/pmatch/${matchId}/?player=${capPlayer.id}`}>
                            <a>
                                <CountryFlag country={capPlayer.country}/>{capPlayer.name}
                            </a>
                        </Link>
                    </>,
                    "className": Functions.getTeamColor(d.cap_team)
                };

                currentRow["travel_time"] = {
                    "value": d.travel_time,
                    "displayValue": Functions.toPlaytime(d.travel_time),
                    "className": "playtime"
                };

                currentRow["carry_time"] = {
                    "value": d.carry_time,
                    "displayValue": Functions.toPlaytime(d.carry_time),
                    "className": "playtime"
                };

                currentRow["time_dropped"] = {
                    "value": d.drop_time,
                    "displayValue": Functions.toPlaytime(d.drop_time),
                    "className": "playtime"
                };

                currentRow["drops"] = {
                    "value": d.total_drops,
                    "displayValue": <MouseOver title="Flag Drops" display={createTotalsHoverData(d.flagDrops, "player_id", null, "")}>
                        {Functions.ignore0(d.total_drops)}
                    </MouseOver>
                };

                currentRow["covers"] = {
                    "value": d.total_covers,
                    "displayValue": <MouseOver title="Covers" display={createTotalsHoverData(d.coverData, "killer_id", null, "")}>
                        {Functions.ignore0(d.total_covers)}
                    </MouseOver>
                };

                currentRow["self_covers"] = {
                    "value": d.total_self_covers,
                    "displayValue": <MouseOver title="Self Covers" display={createTotalsHoverData(d.selfCoverData, "killer_id", null, "")}>
                        {Functions.ignore0(d.total_self_covers)}
                    </MouseOver>
                };

                currentRow["seals"] = {
                    "value": d.total_seals,
                    "displayValue": <MouseOver 
                        title="Seals" 
                        display={createTotalsHoverData(d.flagSeals, "killer_id", null, "")}>{Functions.ignore0(d.total_seals)}
                    </MouseOver>
                };

                currentRow["assists"] = {
                    "value": d.total_assists,
                    "displayValue": <MouseOver title="Flag Assists" display={createAssistHoverData(d.flagAssists)}>
                        {Functions.ignore0(d.total_assists)}
                    </MouseOver>
                };

                currentRow["deaths"] = {
                    "value": d.total_deaths,
                    "displayValue": <MouseOver 
                        title="Flag Deaths" 
                        display={createTotalsHoverData(d.flagDeaths, "victim_id", -1, "killer_id")}>{deathsElem}
                    </MouseOver>
                };
            }

            if(displayMode === 1){

                for(let x = 0; x < totalTeams; x++){

                    currentRow[`team_${x}_kills`] = {
                        "value": d[`team_${x}_kills`],
                        "displayValue": 
                        <MouseOver title="Kills" display={createKillHoverData(d.capKills, x)}>
                            {Functions.ignore0(d[`team_${x}_kills`])}
                        </MouseOver>
                    };

                    currentRow[`team_${x}_suicides`] = {
                        "value": d[`team_${x}_suicides`],
                        "displayValue": <MouseOver title="Suicides" display={createKillHoverData(d.capSuicides, x)}>
                        {Functions.ignore0(d[`team_${x}_suicides`])}
                    </MouseOver>
                    };
                }
            }

            rows.push(currentRow);
        }

        return rows;
    }


    const headers = {
        "score": "Score",
    };

    let tableWidth = 1;

    if(displayMode === 0){

       // headers["taken"] = "Taken";
        //headers["taken_player"] = "Grab Player";
        headers["cap"] = "Capped";
        
        headers["cap_player"] = "Cap Player";
        headers["travel_time"] =  "Travel Time";
        headers["carry_time"] = "Carry Time";
        headers["time_dropped"] = "Time Dropped";
        headers["drops"] = "Drops";
        headers["deaths"] = "Deaths";
        headers["covers"] = "Covers";
        headers["self_covers"] = "Self Covers";
        headers["seals"] = "Seals";
        headers["assists"] = "Assists"; 

    }else if(displayMode === 1){

        headers["cap"] = "Capped";

        for(let i = 0; i < totalTeams; i++){

            headers[`team_${i}_kills`] = `${Functions.getTeamName(i, true)} Kills`;
            headers[`team_${i}_suicides`] = `${Functions.getTeamName(i, true)} Suicides`;
        }

        tableWidth = 2;
    }

    return <div>
        <div className="default-header">Capture The Flag Caps</div>
        <div className="tabs">
            <div className={`tab ${(displayMode === 0) ? "tab-selected" : ""}`} 
            onClick={() =>{ setDisplayMode(0)}}>
                General
            </div>
            <div className={`tab ${(displayMode === 1) ? "tab-selected" : ""}`} 
            onClick={() =>{ setDisplayMode(1)}}>
                Team Frags
            </div>
        </div>
        <InteractiveTable width={tableWidth} data={createTableData()} headers={headers}/>
    </div>

}

export default MatchCTFCaps;
