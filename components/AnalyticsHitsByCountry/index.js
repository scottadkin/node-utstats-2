import CountryFlag from '../CountryFlag';
import Functions from '../../api/functions';
import Table2 from '../Table2';

const AnalyticsHitsByCountry = ({data}) =>{

    const rows = [];

    let d = 0;

    let total = 0;

    let first = null;
    let last = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        if(first === null){
            first = d.first;
        }else{
            if(d.first < first) first = d.first;
        }

        if(d.last > last){
            last = d.last;
        }

        total += d.total;

        rows.push(<tr key={i}>
            <td><CountryFlag country={d.code}/>{d.country}</td>
            <td>{Functions.convertTimestamp(d.first)}</td>
            <td>{Functions.convertTimestamp(d.last)}</td>
            <td>{d.total}</td>
        </tr>);
    }

    rows.push(<tr key={"totals"}>
        <td className="team-green">Total</td>
        <td className="team-green">{Functions.convertTimestamp(first)}</td>
        <td className="team-green">{Functions.convertTimestamp(last)}</td>
        <td className="team-green">{total}</td>
    </tr>);

    return <div>
        <div className="default-header">Hits By Country</div>

        <Table2 width={1}>
            <tr>
                <th>Country</th>
                <th>First Hit</th>
                <th>Last Hit</th>
                <th>Hits</th>
            </tr>
            {rows}
        </Table2>
    </div>
}


export default AnalyticsHitsByCountry;