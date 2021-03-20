import TipHeader from '../TipHeader/';
import CountryFlag from '../CountryFlag/';
import styles from './MatchCTFSummaryTeam.module.css';
import Functions from '../../api/functions';

const bAllEmpty = (data) =>{

    const vars = ['taken','pickup','dropped','assist','capture','cover','kill','return','save'];

    for(let v = 0; v < vars.length; v++){

        if(data[`flag_${vars[v]}`] > 0){
            return false;
        }
    }
   
    return true;
}

const MatchCTFSummaryTeam = ({players, team}) =>{

    players = JSON.parse(players);
    const elems = [];

    let bgColor = Functions.getTeamColor(team);
  

    let p = 0;

    let takenTotal = 0;
    let pickupTotal = 0;
    let droppedTotal = 0;
    let assistTotal = 0;
    let captureTotal = 0;
    let coverTotal = 0;
    let coverPassTotal = 0;
    let coverFailTotal = 0;
    let coverSelfTotal = 0;
    let coverSelfPassTotal = 0;
    let coverSelfFailTotal = 0;
    let killTotal = 0;
    let returnTotal = 0;
    let saveTotal = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i];

        if(!bAllEmpty(p)){
            elems.push(
                <tr key={`ctf_tr_${team}_${i}`} className={bgColor}>
                    <td className="text-left"><CountryFlag key={`ctf_flag_${team}_${i}`} country={p.country}/><a href={`/player/${p.player_id}`}>{p.name}</a></td>

                    <td>{Functions.ignore0(p.flag_taken)}</td>
                    <td>{Functions.ignore0(p.flag_pickup)}</td>
                    <td>{Functions.ignore0(p.flag_dropped)}</td>
                    <td>{Functions.ignore0(p.flag_assist)}</td>
                    <td>{Functions.ignore0(p.flag_capture)}</td>
                    <td>{Functions.ignore0(p.flag_cover)}</td>
                    <td>{Functions.ignore0(p.flag_cover_pass)}</td>
                    <td>{Functions.ignore0(p.flag_cover_fail)}</td>
                    <td>{Functions.ignore0(p.flag_self_cover)}</td>
                    <td>{Functions.ignore0(p.flag_self_cover_pass)}</td>
                    <td>{Functions.ignore0(p.flag_self_cover_fail)}</td>
                    <td>{Functions.ignore0(p.flag_kill)}</td>
                    <td>{Functions.ignore0(p.flag_return)}</td>
                    <td>{Functions.ignore0(p.flag_save)}</td>

                </tr>
            );

            takenTotal += p.flag_taken;
            pickupTotal  += p.flag_pickup;
            droppedTotal += p.flag_dropped;
            assistTotal += p.flag_assist;
            captureTotal += p.flag_capture;
            coverTotal += p.flag_cover;
            coverPassTotal += p.flag_cover_pass;
            coverFailTotal += p.flag_cover_fail;
            coverSelfTotal += p.flag_self_cover;
            coverSelfPassTotal += p.flag_self_cover_pass;
            coverSelfFailTotal += p.flag_self_cover_fail;
            killTotal += p.flag_kill;
            returnTotal += p.flag_return;
            saveTotal += p.flag_save;
        }
    }

    elems.push(
        <tr key={`ctf_flag_${team}_totals`}>
            <td className="text-left">Team Totals</td>

            <td>{Functions.ignore0(takenTotal)}</td>
            <td>{Functions.ignore0(pickupTotal)}</td>
            <td>{Functions.ignore0(droppedTotal)}</td>
            <td>{Functions.ignore0(assistTotal)}</td>
            <td>{Functions.ignore0(captureTotal)}</td>
            <td>{Functions.ignore0(coverTotal)}</td>
            <td>{Functions.ignore0(coverPassTotal)}</td>
            <td>{Functions.ignore0(coverFailTotal)}</td>
            <td>{Functions.ignore0(coverSelfTotal)}</td>
            <td>{Functions.ignore0(coverSelfPassTotal)}</td>
            <td>{Functions.ignore0(coverSelfFailTotal)}</td>
            <td>{Functions.ignore0(killTotal)}</td>
            <td>{Functions.ignore0(returnTotal)}</td>
            <td>{Functions.ignore0(saveTotal)}</td>

        </tr>
    );


    return (
        <table className={`${styles.table} m-bottom-25`}>
            <tbody>
                <tr>
                    <th className="text-left">Player</th>
                    <TipHeader title="Taken" content="Player took the enemy flag from the flag stand." />
                    <TipHeader title="Pickup" content="Player picked up a dropped enemy flag." />
                    <TipHeader title="Drop" content="Player dropped the enemy flag." />
                    <TipHeader title="Assist" content="Player carried the flag at some point before it was captured." />
                    <TipHeader title="Capture" content="Player captured the enemy flag and scored a point for their team." />
                    <TipHeader title="Cover" content="Player killed an enemy that was close to the flag carrier." />
                    <TipHeader title="Cover Pass" content="Player covered the flag carrier that was successfully capped." />
                    <TipHeader title="Cover Fail" content="Player covered the flag carrier but it was returned." /> 
                    <TipHeader title="Self Cover" content="How many kills the player got while carrying the flag." /> 
                    <TipHeader title="Self Cover Pass" content="How many kills the player got while carrying the flag, where the flag got capped." /> 
                    <TipHeader title="Self Cover Fail" content="How many kills the player got while carrying the flag, where the flag got returned." /> 
                    <TipHeader title="Kill" content="Player killed an enemy that had their teams flag." />
                    <TipHeader title="Return" content="Player returned their teams flag that was dropped." />
                    <TipHeader title="Close Return" content="Played returned their teams flag that was close to the enemy flag stand." />
                </tr>
                {elems}
            </tbody>
        </table>

    );
}

export default MatchCTFSummaryTeam;