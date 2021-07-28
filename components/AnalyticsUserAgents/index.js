import Functions from '../../api/functions';

const AnalyticsUserAgents = ({data}) =>{

    const rows = [];

    let d = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        rows.push(<tr key={i}>
            <td>{d.system}</td>
            <td>{d.browser}</td>
            <td>{Functions.convertTimestamp(d.first, true, true)}</td>
            <td>{Functions.convertTimestamp(d.last, true, true)}</td>
            <td>{d.total}</td>
        </tr>);
    }

    return <div>
        <div className="default-header">User Agents</div>

        <table className="t-width-1 td-1-left">
            <tbody>
                <tr>
                    <th>System</th>
                    <th>Browser</th>
                    <th>First</th>
                    <th>Last</th>
                    <th>Total</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}


export default AnalyticsUserAgents;