import Functions from '../../../api/functions';
import Link from 'next/link';

function createLink(display, mode, currentMode, currentOrder){

    let order = "a";

    if(mode === currentMode){

        order = (currentOrder === "a") ? "d" : "a";
    }

    return <Link href={`/classic/maps/${mode}?order=${order}`}><a>{display}</a></Link>
}

const MapsTableView = ({data, mode, order}) =>{

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        rows.push(<tr key={i}>
            <td>{Functions.removeUnr(d.mapfile)}</td>
            <td>{Functions.convertTimestamp(Functions.utDate(d.first_match), true)}</td>
            <td>{Functions.convertTimestamp(Functions.utDate(d.last_match), true)}</td>
            <td>{Functions.MMSS(d.average_gametime)}</td>
            <td>{Functions.toHours(d.gametime).toFixed(2)} Hours</td>
            <td>{d.total_matches}</td>
        </tr>);
    }

    return <div className="m-bottom-25">
        <table className="t-width-1 td-1-left">
            <tbody>
                <tr>
                    <th>{createLink("Name", "name", mode, order)}</th>
                    <th>{createLink("First", "first", mode, order)}</th>
                    <th>{createLink("Last", "last", mode, order)}</th>
                    <th>{createLink("Average Match Length", "avglength", mode, order)}</th>
                    <th>{createLink("Playtime", "playtime", mode, order)}</th>
                    <th>{createLink("Matches", "matches", mode, order)}</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}

export default MapsTableView;