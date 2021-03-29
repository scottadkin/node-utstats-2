import Functions from '../../api/functions';
import styles from './MapSpawns.module.css'

const MapSpawns = ({spawns, flagLocations, mapPrefix}) =>{


    spawns = JSON.parse(spawns);
    const elems = [];

    const flags = JSON.parse(flagLocations);

    const totalDistanceToFlag = [
        {"total": 0, "found": 0},
        {"total": 0, "found": 0},
        {"total": 0, "found": 0},
        {"total": 0, "found": 0}
    ];


    let s = 0;

    let dx = 0;
    let dy = 0;
    let dz = 0;
    let f = 0;
    let distance = 0;

    for(let i = 0; i < spawns.length; i++){

        s = spawns[i];

        if(flags.length > 0){

            f = flags[s.team];

            dx = f.x - s.x;
            dy = f.y - s.y;
            dz = f.z - s.z;

            distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            totalDistanceToFlag[s.team].total += distance;
            totalDistanceToFlag[s.team].found++;
        }
        

        elems.push(<div className={(flags.length > 0) ? `${styles.box} ${Functions.getTeamColor(s.team)}` : `${styles.box} team-none`} key={i}>
            <div>
                <img src="/images/spawn.png" alt="image" />
            </div>
            <div>
                {s.name}<br/>
                Spawns: {s.spawns}<br/>      
                Position: &#123; X: {s.x.toFixed(2)},Y: {s.y.toFixed(2)},Z: {s.z.toFixed(2)}&#125;<br/>
                {(flags.length > 0) ? <span>Distance to Flag: {distance.toFixed(2)}</span> : null}
            </div>
        </div>);

        /*elems.push(<tr className={(flags.length > 0) ? Functions.getTeamColor(s.team) : "team-none"} key={i}>
            <td>{s.name}</td>
            {(mapPrefix !== "dm" && mapPrefix !== "dom") ? <td>{s.team}</td> : null}
            <td>{s.x.toFixed(2)}</td>
            <td>{s.y.toFixed(2)}</td>
            <td>{s.z.toFixed(2)}</td>
            <td>{s.spawns}</td>
            {(flags.length > 0) ? <td>{distance.toFixed(2)}</td> : null}
        </tr>);*/
    }

    if(elems.length > 0){

        /*elems.unshift(<tr key={"end"}>
            <th>Name</th>
            {(mapPrefix !== "dm" && mapPrefix !== "dom") ? <th>Assigned Team</th> : null}
            <th>X</th>
            <th>Y</th>
            <th>Z</th>
            <th>Total Spawns</th>
            {(flags.length > 0) ? <th>Distance to Team Flag</th> : null}
        </tr>);*/
    }


    let flagsTable = null;

    if(flags.length > 0){

        const averageDistanceElem = [];
        
        /*averageDistanceElem.push(<tr key={"start"}>
            <th>
                Total Spawns
            </th>
            <th>
                Total Distance to Flag
            </th>
            <th>
                Average Distance to Flag
            </th>
        </tr>);*/

        for(let i = 0; i < totalDistanceToFlag.length; i++){

            if(totalDistanceToFlag[i].found > 0){

                /*averageDistanceElem.push(<tr className={Functions.getTeamColor(i)} key={i}>
                    <td>
                        {totalDistanceToFlag[i].found}
                    </td>
                    <td>
                        {totalDistanceToFlag[i].total.toFixed(2)}
                    </td>
                    <td>
                        {(totalDistanceToFlag[i].total / totalDistanceToFlag[i].found).toFixed(2)}
                    </td>
                </tr>);*/
            }
        }

        flagsTable = <div>    
            <div className="default-header m-top-10">Spawn Distances to Flag</div>
            <table>
                <tbody>
                    {averageDistanceElem}
                </tbody>
            </table>
        </div>;

    }

    if(elems.length !== 0){

        return <div className="m-bottom-10">
            <div className="default-header">Spawn Points</div>
                  
               {elems}
                
            {flagsTable}

        </div>
    }

    return elems;
    
}


export default MapSpawns;