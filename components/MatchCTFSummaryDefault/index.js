import TipHeader from '../TipHeader/';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';

const bAnyData = (player) =>{

    const types = [
        "flag_taken",
        "flag_pickup",
        "flag_dropped",
        "flag_assist",
        "flag_capture",
        "flag_cover",
        "flag_kill",
        "flag_return",
        "flag_save"
    ];


    for(let i = 0; i < types.length; i++){

        if(player[types[i]] !== 0) return true;
    }

    return false;
}

const MatchCTFSummaryDefault = ({players, team}) =>{


    const elems = [];

    let p = 0;

    let totals = {
        "taken": 0,
        "pickup": 0,
        "dropped": 0,
        "assist": 0,
        "cover": 0,
        "capture": 0,
        "kill": 0,
        "return": 0,
        "save": 0,
    };

    for(let i = 0; i < players.length; i++){

        p = players[i];

        if(!bAnyData(p)) continue;

        totals.taken += p.flag_taken;
        totals.pickup += p.flag_pickup;
        totals.dropped += p.flag_dropped;
        totals.assist += p.flag_assist;
        totals.capture += p.flag_capture;
        totals.cover += p.flag_cover;
        totals.kill += p.flag_kill;
        totals.return += p.flag_return;
        totals.save += p.flag_save;

        elems.push(<tr className={Functions.getTeamColor(team)} key={i}>
            <td className="text-left"><CountryFlag country={p.country}/><Link href={`/player/${p.player_id}`}><a>{p.name}</a></Link></td>
            <td>{Functions.ignore0(p.flag_taken)}</td>
            <td>{Functions.ignore0(p.flag_pickup)}</td>
            <td>{Functions.ignore0(p.flag_dropped)}</td>
            <td>{Functions.ignore0(p.flag_assist)}</td>
            <td>{Functions.ignore0(p.flag_cover)}</td>
            <td>{Functions.ignore0(p.flag_capture)}</td>
            <td>{Functions.ignore0(p.flag_kill)}</td>
            <td>{Functions.ignore0(p.flag_return)}</td>
            <td>{Functions.ignore0(p.flag_save)}</td>
    
        </tr>);
    }

    elems.push(<tr key={`totals`}>
            <td className="text-left">Totals</td>
            <td>{totals.taken}</td>
            <td>{totals.pickup}</td>
            <td>{totals.dropped}</td>
            <td>{totals.assist}</td>
            <td>{totals.cover}</td>
            <td>{totals.capture}</td>
            <td>{totals.kill}</td>
            <td>{totals.return}</td>
            <td>{totals.save}</td>

    
        </tr>);
    
    
    

    return <table className={`m-bottom-25`}>
        <tbody>
            <tr>
                <th>Player</th>
                <TipHeader title="Taken" content="Player took the flag from the enemy team's flag stand." />
                <TipHeader title="Pickup" content="Player picked up the flag that was dropped by a team mate." />
                <TipHeader title="Dropped" content="Player dropped the enemy flag." />
                <TipHeader title="Assist" content="Player had carried the flag that was later capped." />
                <TipHeader title="Cover" content="Player covered their team mate that had the enemy flag." />
                <TipHeader title="Capture" content="Player capped the enemy flag scoring a point for their team." />
                <TipHeader title="Kill" content="Player killed an enemy that was carrying their team's flag." />
                <TipHeader title="Return" content="Player returned their flag that was dropped by an enemy." />
                <TipHeader title="Close Return" content="Player returned their flag that was dropped by an enemy, that was close to being capped." />
            </tr>
            {elems}
        </tbody>
    </table>
}

export default MatchCTFSummaryDefault;