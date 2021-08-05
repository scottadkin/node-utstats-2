import Functions from "../../../api/functions";
import CountryFlag from '../../CountryFlag';
import Link from 'next/link';

function bAnyData(player){

    const types = ["pads", "armour", "keg", "invis", "belt", "amp"];

    for(let i = 0; i < types.length; i++){

        if(player[`pu_${types[i]}`] > 0) return true;
    }

    return false;
}

const MatchPickupsSummary = ({data, matchId, teams}) =>{

    const rows = [];

    let d = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        if(!bAnyData(d)) continue;

        rows.push(<tr key={i}>
            <td className={(teams >= 2) ? Functions.getTeamColor(d.team) : null}>
                <Link href={`/classic/pmatch/${matchId}?p=${d.pid}`}>
                    <a>
                        <CountryFlag country={d.country}/>
                        {d.name}
                    </a>
                </Link>
            </td>
            <td>{Functions.ignore0(d.pu_pads)}</td>
            <td>{Functions.ignore0(d.pu_armour)}</td>
            <td>{Functions.ignore0(d.pu_keg)}</td>
            <td>{Functions.ignore0(d.pu_invis)}</td>
            <td>{Functions.ignore0(d.pu_belt)}</td>
            <td>{Functions.ignore0(d.pu_amp)}</td>
        </tr>);
    }

    if(rows.length === 0) return null;


    return <div className="m-bottom-25">
        <div className="default-header">Pickups Summary</div>
        <table className="t-width-1 td-1-left td-1-150">
            <tbody>
                <tr>
                    <th>Player</th>
                    <th>Pads</th>
                    <th>Armor</th>
                    <th>Super Health</th>
                    <th>Invisibility</th>
                    <th>Shield Belt</th>
                    <th>Damage Amp</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>

}


export default MatchPickupsSummary;