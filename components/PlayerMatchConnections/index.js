import Functions from '../../api/functions';
import Table2 from '../Table2';

const PlayerMatchConnections = ({data, matchStart}) =>{

    const rows = [];

    for(let i = 0; i < data.length; i++){

        rows.push(<tr key={i}>
            <td>{Functions.MMSS(data[i].timestamp - matchStart)}</td>
            <td>{(data[i].event === 0) ? "Joined the server" : "Left the server"}</td>
        </tr>);
    }

    return <div className="m-bottom-25">
        <div className="default-header">Connection Summary</div>
        <Table2 width={2}>
            <tr>
                <th>Timestamp</th>
                <th>Event</th>
            </tr>
            {rows}
        </Table2>
    </div>
}

export default PlayerMatchConnections;