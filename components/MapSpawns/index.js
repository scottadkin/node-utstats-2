import Functions from '../../api/functions';
import Table2 from '../../components/Table2';

function setDistancesToFlag(spawns, flags, totalDistanceToFlag){

    let dx = 0;
    let dy = 0;
    let dz = 0;
    let f = 0;
    let distance = 0;
    let s = 0;


    for(let i = 0; i < spawns.length; i++){

        s = spawns[i];

        f = flags[s.team];

        dx = f.x - s.x;
        dy = f.y - s.y;
        dz = f.z - s.z;

        distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

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

const MapSpawns = ({spawns, flagLocations}) =>{


    spawns = JSON.parse(spawns);

    let elems = [];

    const flags = JSON.parse(flagLocations);

    const totalDistanceToFlag = [
        {"total": 0, "found": 0},
        {"total": 0, "found": 0},
        {"total": 0, "found": 0},
        {"total": 0, "found": 0}
    ];

    let s = 0;

    if(flags.length > 0){
        setDistancesToFlag(spawns, flags, totalDistanceToFlag);
    }
    

    for(let i = 0; i < spawns.length; i++){

        s = spawns[i];

        elems.push(<tr key={i}>
            <td className={Functions.getTeamColor(s.team)}>{s.name}</td>
            <td>{s.x.toFixed(2)}</td>
            <td>{s.y.toFixed(2)}</td>
            <td>{s.x.toFixed(2)}</td>
            <td>{s.spawns}</td>
            {(flags.length > 0) ? <td>{s.distance.toFixed(2)}</td> : null}
        </tr>);
    }

    if(elems.length > 0){
        elems = <Table2 width={1}>
            <tr>
                <th>Name</th>
                <th>Position X</th>
                <th>Position Y</th>
                <th>Position Z</th>
                <th>Spawns</th>
                {(flags.length > 0) ? <th>Distance To Flag</th> : null}
            </tr>
            {elems}
        </Table2>
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

                averageDistanceElem.push(<tr key={i}>

                        <td className={Functions.getTeamColor(i)}>{Functions.getTeamName(i)}</td>
                        <td>{totalDistanceToFlag[i].found}</td>
                        <td>{totalDistanceToFlag[i].total.toFixed(2)}</td>
                        <td>{(totalDistanceToFlag[i].total / totalDistanceToFlag[i].found).toFixed(2)}</td>
                        <td className={(percentOfLowest > 100) ? "red" : "green"}>{(percentOfLowest == 100) ? "" : `${Math.abs(100 -percentOfLowest).toFixed(2)}%`}</td>
                </tr>);

            }
        }

        flagsTable = <div>    
            <div className="default-header m-top-10">Spawn Distances to Flag</div>
            
                <Table2 width={1}>
                    <tr>
                        <th>Team</th>
                        <th>Spawn Points</th>
                        <th>Total Distance</th>
                        <th>Average Distance</th>
                        <th>Disadvantage</th>
                    </tr>
                    {averageDistanceElem}
                </Table2>
                
               
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


export default MapSpawns;