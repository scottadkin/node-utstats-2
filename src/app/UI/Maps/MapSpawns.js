import { BasicTable } from '../Tables';
import { getTeamColor, getTeamName } from '../../../../api/generic.mjs';

function setDistancesToFlag(spawns, flags, totalDistanceToFlag){

    for(let i = 0; i < spawns.length; i++){

        const s = spawns[i];

        const f = flags[s.team];

        const dx = f.x - s.x;
        const dy = f.y - s.y;
        const dz = f.z - s.z;

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        totalDistanceToFlag[s.team].total += distance;
        totalDistanceToFlag[s.team].found++;
        spawns[i].distance = distance;

    }

    spawns.sort((a, b) =>{

        a = a.distance;
        b = b.distance;

        if(a > b){
            return 1;
        }else if(a < b){
            return -1;
        }

        return 0;
    });

}

export default function MapSpawns({spawns, flagLocations}){

    let elems = [];

    const flags = flagLocations;

    const totalDistanceToFlag = [
        {"total": 0, "found": 0},
        {"total": 0, "found": 0},
        {"total": 0, "found": 0},
        {"total": 0, "found": 0}
    ];


    if(flags.length > 0){
        setDistancesToFlag(spawns, flags, totalDistanceToFlag);
    }
    

    for(let i = 0; i < spawns.length; i++){

        const s = spawns[i];

        const e = [
            {"className": getTeamColor(s.team), "value": s.name},
            s.x.toFixed(2),
            s.y.toFixed(2),
            s.x.toFixed(2),
            s.spawns,
        ];

        if(flags.length > 0) e.push(s.distance.toFixed(2));

        elems.push(e);
    }

    if(elems.length > 0){

        const headers = ["Name", "Position X", "Position Y", "Position Z", "Spawns"];

        if(flags.length > 0) headers.push("Distance To Flag");

        elems = <BasicTable width={1} headers={headers} rows={elems}/>
    }


    let flagsTable = null;

    if(flags.length > 0){

        const averageDistanceElem = [];
        
        let lowestDistance = 0;

        for(let i = 0; i < totalDistanceToFlag.length; i++){

            if(totalDistanceToFlag[i].found > 0){
                if(i === 0 || totalDistanceToFlag[i].total < lowestDistance){
                    lowestDistance = totalDistanceToFlag[i].total;
                }
            }
        }

        let percentOfLowest = 0;


        for(let i = 0; i < totalDistanceToFlag.length; i++){

            if(totalDistanceToFlag[i].found > 0){

                percentOfLowest = ((totalDistanceToFlag[i].total / lowestDistance) * 100).toFixed(2);

                averageDistanceElem.push([

                    {"className": getTeamColor(i), "value": getTeamName(i)},
                    totalDistanceToFlag[i].found,
                    totalDistanceToFlag[i].total.toFixed(2),
                    (totalDistanceToFlag[i].total / totalDistanceToFlag[i].found).toFixed(2),
                    {
                        "className": (percentOfLowest > 100) ? "red" : "green", 
                        "value": (percentOfLowest === 100) ? "" : `${Math.abs(100 -percentOfLowest).toFixed(2)}%`
                    }
                ]);

            }
        }

        const headers = ["Team", "Spawn Points", "Total Distance", "Average Distance", "Disadvantage"];

        flagsTable = <div>    
            <div className="default-header m-top-10">Spawn Distances to Flag</div>
            <BasicTable width={1} headers={headers} rows={averageDistanceElem}/>
        </div>;
    }

    if(elems.length !== 0){

        return <div className="m-bottom-10 center">
            <div className="default-header">Spawn Points</div>         
               {elems}        
            {flagsTable}
        </div>
    }

    return elems;  
}