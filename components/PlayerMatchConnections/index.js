import Functions from '../../api/functions';

const PlayerMatchConnections = ({data, matchStart}) =>{

    const rows = [];

    for(let i = 0; i < data.length; i++){

        rows.push(<tr key={i}>
            <td>{Functions.MMSS(data[i].timestamp - matchStart)}</td>
            <td>{(data[i].event === 0) ? "Joined the server" : "Left the server"}</td>
        </tr>);
    }

    return <div>
        <div className="default-header">Connection Summary</div>
        <table>
            <tbody>
                <tr>
                    <th>Timestamp</th>
                    <th>Event</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}

export default PlayerMatchConnections;