import styles from './MapControlPoints.module.css';

const MapControlPoints = ({points, mapPrefix}) =>{
    
    const elems = [];

    if(mapPrefix === "dom"){

        points = JSON.parse(points);

        for(let i = 0; i < points.length; i++){

            elems.push(<tr key={i}>
                <td>{points[i].name}</td>
                <td>{Math.floor(points[i].x)}</td>
                <td>{Math.floor(points[i].y)}</td>
                <td>{Math.floor(points[i].z)}</td>
                <td>{points[i].captured}</td>
                <td>{(points[i].captured / points[i].matches).toFixed(1)}</td>
            </tr>);
           
        }

        return <div className="m-bottom-10">
            <div className="default-header">Domination Control Points</div>
            <table className="t-width-1">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Position X</th>
                        <th>Position Y</th>
                        <th>Position Z</th>
                        <th>Caps</th>
                        <th>Average Caps</th>
                    </tr>
                    {elems}
                </tbody>
            </table>
            
        </div>
    }



    return elems;

}


export default MapControlPoints;