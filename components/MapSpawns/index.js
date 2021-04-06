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

    let boxClass = `${styles.box} ${styles.boxnoteam}`;

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

            boxClass = styles.box;
        }
        

        elems.push(<div className={(flags.length > 0) ? `${boxClass} ${Functions.getTeamColor(s.team)}` : `${boxClass} team-none`} key={i}>
            <div>
                <img src="/images/spawn.png" alt="image" />
            </div>
            <div>
                {s.name}<br/>
                Spawns: {s.spawns}<br/>      
                Position: <span className="yellow">X</span> {s.x.toFixed(2)} <span className="yellow">Y</span>  {s.y.toFixed(2)} <span className="yellow">Z</span> {s.z.toFixed(2)}<br/>
                {(flags.length > 0) ? <span>Distance to Flag: {distance.toFixed(2)}</span> : null}
            </div>
        </div>);
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

                averageDistanceElem.push(<div className={`${styles.flag} ${Functions.getTeamColor(i)}`} key={i}>
                    <div>
                        <img src="/images/spawn.png" alt="image" />
                    </div>
                    <div>
                        {totalDistanceToFlag[i].found} Spawns<br/>
                        Total Distance to Flag {totalDistanceToFlag[i].total.toFixed(2)}<br/>
                        Average Distance to Flag {(totalDistanceToFlag[i].total / totalDistanceToFlag[i].found).toFixed(2)}<br/>
                        <span className={(percentOfLowest > 100) ? "orange" : "green"}>{percentOfLowest}%</span>
                    </div>
                </div>);
            }
        }

        flagsTable = <div>    
            <div className="default-header m-top-10">Spawn Distances to Flag</div>
            
                {averageDistanceElem}
               
        </div>;

    }

    if(elems.length !== 0){

        return <div className="m-bottom-10 t-width-1 center">
            <div className="default-header">Spawn Points</div>
                  
               {elems}
                
            {flagsTable}

        </div>
    }

    return elems;
    
}


export default MapSpawns;