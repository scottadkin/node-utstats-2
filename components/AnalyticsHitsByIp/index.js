import Functions from '../../api/functions';

const AnalyticsHitsByIp = ({data}) =>{

    const rows = [];

    let d = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        rows.push(<tr key={i}>
            <td>{d.ip}</td>
            <td>{Functions.convertTimestamp(d.first)}</td>
            <td>{Functions.convertTimestamp(d.last)}</td>
            <td>{d.total}</td>
        </tr>);
    }

    return <div>
        <div className="default-header">Hits By Ip</div>
        <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Ip</th>
                    <th>First</th>
                    <th>Last</th>
                    <th>Hits</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}

export default AnalyticsHitsByIp;