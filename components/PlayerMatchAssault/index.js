import Functions from '../../api/functions';
import Table2 from '../Table2';

const getObjectiveName = (objs, id) =>{

    for(let i = 0; i < objs.length; i++){

        if(objs[i].obj_id == id){
            return objs[i].name;
        }
    }
    return "Not Found";
}

const PlayerMatchAssault = ({pointNames, caps}) =>{

    if(pointNames.length === 0) return null;

    const rows = [];

    for(let i = 0; i < caps.length; i++){

        rows.push(<tr key={i}>
            <td>{Functions.MMSS(caps[i].timestamp)}</td>
            <td>{getObjectiveName(pointNames, caps[i].obj_id)}</td>
            <td>{(caps[i].bFinal) ? "True" : null}</td>
        </tr>);
    }

    return <div className="m-bottom-25">
        <div className="default-header">Assault Objectives Summary</div>
        <Table2 width={2}>
            <tr>
                <th>Timestamp</th>
                <th>Objective Name</th>
                <th>Final Objective</th>
            </tr>
            {rows}
        </Table2>
    </div>
}


export default PlayerMatchAssault;