import styles from './MapControlPoints.module.css';

const MapControlPoints = ({points, mapPrefix}) =>{
    
    const elems = [];

    if(mapPrefix === "dom"){

        points = JSON.parse(points);

        for(let i = 0; i < points.length; i++){

            elems.push(<div className={styles.box} key={i}>

                <div>
                    <img src="/images/controlpoint.png" alt="icon" />
                </div>
                <div>
                    <span className={styles.name}>{points[i].name}</span><br/>
                    Captured: {points[i].captured}<br/>
                    Avg Caps: {(points[i].captured / points[i].matches).toFixed(1)}<br/>
                    <span className={styles.position}>
                        Position: &#123;<span className="yellow">X</span>: {Math.floor(points[i].x)},<span className="yellow">Y</span> 
                        : {Math.floor(points[i].y)}, <span className="yellow">Z</span>: {Math.floor(points[i].z)}&#125;
                    </span>
                </div>
            </div>);
        }

        return <div className="m-bottom-10">
            <div className="default-header">Domination Control Points</div>
            {elems}
        </div>
    }



    return elems;

}


export default MapControlPoints;