import CountryFlag from '../CountryFlag';
import Functions from '../../api/functions';

const AnalyticsHitsByCountry = ({data}) =>{

    const rows = [];

    let d = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        rows.push(<tr key={i}>
            <td><CountryFlag country={d.code}/>{d.country}</td>
            <td>{Functions.convertTimestamp(d.first)}</td>
            <td>{Functions.convertTimestamp(d.last)}</td>
            <td>{d.total}</td>
        </tr>);
    }

    return <div>
        <div className="default-header">Hits By Country</div>

        <table className="t-width-1 td-1-left">
            <tbody>
                <tr>
                    <th>Country</th>
                    <th>First Hit</th>
                    <th>Last Hit</th>
                    <th>Hits</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}


export default AnalyticsHitsByCountry;