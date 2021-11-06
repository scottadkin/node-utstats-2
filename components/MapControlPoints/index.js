import styles from './MapControlPoints.module.css';
import Table2 from '../Table2';

const MapControlPoints = ({points, mapPrefix}) =>{
    


    

    const elems = [];

    if(mapPrefix === "dom"){

        points = JSON.parse(points);

        if(points.length === 0) return null;

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
            <Table2 width={1}>
                    <tr>
                        <th>Name</th>
                        <th>Position X</th>
                        <th>Position Y</th>
                        <th>Position Z</th>
                        <th>Caps</th>
                        <th>Average Caps</th>
                    </tr>
                    {elems}
            </Table2>
            
        </div>
    }



    return elems;

}


export default MapControlPoints;