import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import InteractiveTable from '../InteractiveTable';
import React from 'react';
import MouseOver from '../MouseOver';

const MatchFragDistances = ({matchId, playerData, totalTeams, bSeparateByTeam, single}) =>{

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
                        
                            <CountryFlag country={p.country}/>
                            {p.name}
                        
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

        if(rows.length > 0 && !single){

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

    if(!bSeparateByTeam || single || totalTeams < 2) return renderTable(-1);

    const tables = [];

    for(let i = 0; i < totalTeams; i++){

        tables.push(renderTable(i));
    }

    return <div>
        {tables}
    </div>
}

export default MatchFragDistances;
