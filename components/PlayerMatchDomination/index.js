import Functions from '../../api/functions';
import Table2 from '../Table2';

const getTotalPointCaps = (id, data) =>{

    let total = 0;

    let d = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        if(d.point === id) total++;
    }

    return total;
}

const PlayerMatchDomination = ({data, pointNames}) =>{

    if(data.length === 0) return null;

    const headers = [];
    const cols = [];

    for(let i = 0; i < pointNames.length; i++){

        headers.push(<th key={i}>{pointNames[i].name}</th>);
        cols.push(<td key={i}>{Functions.ignore0(getTotalPointCaps(pointNames[i].id, data))}</td>);
    }

    return <div className="m-bottom-25">
        <div className="default-header">Domination Control Points Caps</div>
        <Table2 width={2}>
            <tr>
                {headers}
            </tr>
            <tr>
                {cols}
            </tr>
        </Table2>
    </div>
}


export default PlayerMatchDomination;