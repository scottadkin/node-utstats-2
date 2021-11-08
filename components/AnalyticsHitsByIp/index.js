import Functions from '../../api/functions';
import Table2 from '../Table2';

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
        <Table2 width={1}>
            <tr>
                <th>Ip</th>
                <th>First</th>
                <th>Last</th>
                <th>Hits</th>
            </tr>
            {rows}
        </Table2>
    </div>
}

export default AnalyticsHitsByIp;