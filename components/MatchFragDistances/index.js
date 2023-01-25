import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import InteractiveTable from '../InteractiveTable';
import React from 'react';
import MouseOver from '../MouseOver';

const MatchFragDistances = ({matchId, playerData, totalTeams, bSeparateByTeam}) =>{

    const headers = {
        "player": "Player",
        "shortest": "Shorest Distance",
        "average": "Average Distance",
        "longest": "Longest Distance",
        "close": {
            "title": "Close Range", 
            "detailedTitle": "Close Range Kills",
            "content": "Player killed an enemy that was at a distance of 1536uu or less."
        },
        "long": {
            "title": "Long Range", 
            "detailedTitle": "Long Range Kills",
            "content": "Player killed an enemy that was at a distance between 1536uu to 3071uu."
        },
        "uber": {
            "title": "Uber Long Range", 
            "detailedTitle": "Uber Long Range Kills",
            "content": "Player killed an enemy that was over a distance of 3072uu."
        },
    };

    const renderTable = (teamId) =>{

        const totals = {
            "shortest": null,
            "average": null,
            "longest": null,
            "close": 0,
            "long": 0,
            "uber": 0
        };

        const rows = [];

        for(let i = 0; i < playerData.length; i++){

            const p = playerData[i];

            if(teamId !== -1 && p.team !== teamId) continue;

            if(totals.shortest === null)    totals.shortest = p.shortest_kill_distance;
            if(totals.average === null)    totals.average = p.average_kill_distance;
            if(totals.longest === null)    totals.longest = p.longest_kill_distance;
            

            if(totals.shortest > p.shortest_kill_distance){
                totals.shortest = p.shortest_kill_distance;
            }

            if(totals.average < p.average_kill_distance){
                totals.average = p.average_kill_distance;
            }

            if(totals.longest < p.longest_kill_distance){
                totals.longest = p.longest_kill_distance;
            }

            totals.close += p.k_distance_normal;
            totals.long += p.k_distance_long;
            totals.uber += p.k_distance_uber;

            rows.push({
                "player": {
                    "value": p.name.toLowerCase(),
                    "displayValue": <Link href={`/pmatch/${matchId}/?player=${p.player_id}`}>
                        <a>
                            <CountryFlag country={p.country}/>
                            {p.name}
                        </a>
                    </Link>,
                    "className": `${Functions.getTeamColor(p.team)} player`
                },
                "shortest": {
                    "value": p.shortest_kill_distance,
                    "displayValue":  p.shortest_kill_distance.toFixed(2),
                    
                },"average": {
                    "value": p.average_kill_distance,
                    "displayValue": p.average_kill_distance.toFixed(2)
                },"longest": {
                    "value": p.longest_kill_distance,
                    "displayValue": p.longest_kill_distance.toFixed(2)
                },"close": {
                    "value": p.k_distance_normal,
                    "displayValue": Functions.ignore0(p.k_distance_normal)
                },"long": {
                    "value": p.k_distance_long,
                    "displayValue": Functions.ignore0(p.k_distance_long)
                },"uber": {
                    "value": p.k_distance_uber,
                    "displayValue": Functions.ignore0(p.k_distance_uber)
                },
            });
        }

        if(rows.length > 0){

            rows.push({
                "bAlwaysLast": true,
                "player": {
                    "value": "Totals/Best",
                },
                "shortest": {
                    "value": totals.shortest,
                    "displayValue":  
                    <MouseOver title="Shortest Kill Distance" 
                        display="The shortest distance between a killer and a victim.">
                        {totals.shortest.toFixed(2)}
                    </MouseOver>,
                    
                },"average": {
                    "value": totals.average,
                    "displayValue":  <MouseOver 
                        title="Longest Average Kill Distance" 
                        display="The longest average kill distance between a killer and victim.">
                        {totals.average.toFixed(2)}
                    </MouseOver>,
                },"longest": {
                    "value": totals.longest,
                    "displayValue":  <MouseOver 
                        title="Longest Kill Distance" 
                        display="The longest kill distance between a killer and victim.">
                        {totals.longest.toFixed(2)}
                    </MouseOver>,
                },"close": {
                    "value": totals.close,
                    "displayValue": Functions.ignore0(totals.close)
                },"long": {
                    "value": totals.long,
                    "displayValue": Functions.ignore0(totals.long)
                },"uber": {
                    "value": totals.uber,
                    "displayValue": Functions.ignore0(totals.uber)
                },
            });
        }

        return <InteractiveTable key={teamId} width={1} headers={headers} data={rows}/>;
    }

    if(!bSeparateByTeam) return renderTable(-1);

    const tables = [];

    for(let i = 0; i < totalTeams; i++){

        tables.push(renderTable(i));
    }

    return <div>
        {tables}
    </div>
}

export default MatchFragDistances;
/*
const bAnyData = (data) =>{
    
    const types = [
        "shortest_kill_distance",
        "average_kill_distance",
        "longest_kill_distance",
        "k_distance_normal",
        "k_distance_long",
        "k_distance_uber"
    ];

    for(let i = 0; i < types.length; i++){

        if(data[types[i]] != 0) return true;
    }

    return false;
}

const MatchFragDistances = ({host, players, team, toDisplay, single, matchId}) =>{

    const elems = [];

    let bgColor = Functions.getTeamColor(team);

    let shortestKillTotal = 0;
    let totalAverage = 0;
    let longestKillTotal = 0;

    let totalCloseRange = 0;
    let totalLongRange = 0;
    let totalUberRange = 0;

    let index = 0;

    for(let i = 0; i < players.length; i++){

        const p = players[i];

        if(p.team !== team && team !== -1) continue;
        
        if(index === 0){

            shortestKillTotal = p.shortest_kill_distance;
            longestKillTotal = p.longest_kill_distance;

        }else{

            if(shortestKillTotal === 0){
                shortestKillTotal = p.shortest_kill_distance;
            }else{

                if(p.shortest_kill_distance > 0){
                    shortestKillTotal = p.shortest_kill_distance
                }
            }

            if(p.longest_kill_distance > longestKillTotal) longestKillTotal = p.longest_kill_distance;
        }

        totalCloseRange += p.k_distance_normal;
        totalLongRange += p.k_distance_long;
        totalUberRange += p.k_distance_uber;

        totalAverage += p.average_kill_distance;

        if(bAnyData(p)){

            elems.push(<tr key={i}>
                {(single) ? null :
                <td className={`text-left name-td ${bgColor}`}>
                    <Link href={`/pmatch/${matchId}?player=${p.player_id}`}><a><CountryFlag host={host} country={p.country}/>{p.name}</a></Link>
                </td>}
                <td style={(single) ? {textAlign: "center"} : {} }>{Functions.ignore0(p.shortest_kill_distance.toFixed(2))}</td>
                <td>{Functions.ignore0(p.average_kill_distance.toFixed(2))}</td>
                <td>{Functions.ignore0(p.longest_kill_distance.toFixed(2))}</td>
                {(toDisplay.indexOf("k_distance_normal") !== -1) ?  <td>{Functions.ignore0(p.k_distance_normal)}</td> : null }
                {(toDisplay.indexOf("k_distance_long") !== -1) ?  <td>{Functions.ignore0(p.k_distance_long)}</td> : null }
                {(toDisplay.indexOf("k_distance_uber") !== -1) ?  <td>{Functions.ignore0(p.k_distance_uber)}</td> : null }
            </tr>);
        }

        index++;
    }

    if(totalAverage > 0 && index > 0){

        totalAverage = totalAverage / index;
    }

    if(elems.length > 0 && !single){
        
        elems.push(<tr key={"end"}>
            {(single) ? null :<td className="text-left">Best/Totals</td>}
            <td>{parseFloat(Functions.ignore0(shortestKillTotal)).toFixed(2)}</td>
            <td>{parseFloat(Functions.ignore0(totalAverage)).toFixed(2)}</td>
            <td>{parseFloat(Functions.ignore0(longestKillTotal)).toFixed(2)}</td>
            {(toDisplay.indexOf("k_distance_normal") !== -1) ? <td>{Functions.ignore0(totalCloseRange)}</td> : null}
            {(toDisplay.indexOf("k_distance_long") !== -1) ?  <td>{Functions.ignore0(totalLongRange)}</td> : null}
            {(toDisplay.indexOf("k_distance_uber") !== -1) ? <td>{Functions.ignore0(totalUberRange)}</td> : null}
        </tr>);
    }

    if(elems.length > 0){

        elems.unshift(<tr key={"start"}>
            {(single) ? null :<th>Player</th>}
            <th>Shortest Distance</th>
            <th>Average Distance</th>
            <th>Longest Distance</th>
            {(toDisplay.indexOf("k_distance_normal") !== -1) ? <TipHeader title="Close Range Kills" content="Kills with a distance of less than 1536uu." /> : null}
            {(toDisplay.indexOf("k_distance_long") !== -1) ? <TipHeader title="Long Range Kills" content="Kills with a distance of 1536uu to 3071uu." /> : null}
            {(toDisplay.indexOf("k_distance_uber") !== -1) ? <TipHeader title="Uber Long Range Kills" content="Kills with a distance of 3072 and greater." /> : null}
        </tr>);

        return <Table2 width={1} players={true}>
            {elems}
        </Table2>
    }

    return null;

}


export default MatchFragDistances;*/