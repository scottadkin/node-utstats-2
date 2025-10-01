import { BasicTable } from "../Tables";

export default function MapControlPoints({points}){

    if(points.length === 0) return null;

    const elems = [];

    for(let i = 0; i < points.length; i++){

        elems.push([
            points[i].name,
            points[i].x,
            points[i].y,
            points[i].z,
            points[i].captured,
            (points[i].captured / points[i].matches).toFixed(1),
        ]);   
    }
    
    const headers = [
        "Name", "Position X", "Position Y", "Position Z", "Caps", "Average Caps"
    ];
    
    const styles = ["text-left", null, null, null, null, null];

    return <div className="m-bottom-10">
        <div className="default-header">Domination Control Points</div>
        <BasicTable width={1} headers={headers} rows={elems} columnStyles={styles}/>   
    </div>
    




}