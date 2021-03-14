import TipHeader from '../TipHeader/';
import CountryFlag from '../CountryFlag/';
import styles from './MatchCTFSummaryTeam.module.css';

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

    let bgColor = '';


    switch(team){
        case 0: {  bgColor = "team-red"; } break;
        case 1: {  bgColor = "team-blue"; } break;
        case 2: {  bgColor = "team-green"; } break;
        case 3: {  bgColor = "team-yellow"; } break;
        default: { bgColor = "team-none";} break;
    }
  

    let p = 0;

    let takenTotal = 0;
    let pickupTotal = 0;
    let droppedTotal = 0;
    let assistTotal = 0;
    let captureTotal = 0;
    let coverTotal = 0;
    let killTotal = 0;
    let returnTotal = 0;
    let saveTotal = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i];

        if(!bAllEmpty(p)){
            elems.push(
                <tr key={`ctf_tr_${team}_${i}`} className={bgColor}>
                    <td className="text-left"><CountryFlag key={`ctf_flag_${team}_${i}`} country={p.country}/><a href={`/player/${p.player_id}`}>{p.name}</a></td>
                    <td>{(p.flag_taken > 0) ? p.flag_taken : ''}</td>
                    <td>{(p.flag_pickup > 0) ? p.flag_pickup : ''}</td>
                    <td>{(p.flag_dropped > 0) ? p.flag_dropped : ''}</td>
                    <td>{(p.flag_assist > 0) ? p.flag_assist : ''}</td>
                    <td>{(p.flag_capture > 0) ? p.flag_capture : ''}</td>
                    <td>{(p.flag_cover > 0) ? p.flag_cover : ''}</td>
                    <td>{(p.flag_kill > 0) ? p.flag_kill : ''}</td>
                    <td>{(p.flag_return > 0) ? p.flag_return : ''}</td>
                    <td>{(p.flag_save > 0) ? p.flag_save : ''}</td>
                </tr>
            );

            takenTotal += p.flag_taken;
            pickupTotal  += p.flag_pickup;
            droppedTotal += p.flag_dropped;
            assistTotal += p.flag_assist;
            captureTotal += p.flag_capture;
            coverTotal += p.flag_cover;
            killTotal += p.flag_kill;
            returnTotal += p.flag_return;
            saveTotal += p.flag_save;
        }
    }

    elems.push(
        <tr key={`ctf_flag_${team}_totals`}>
            <td className="text-left">Team Totals</td>
            <td>{(takenTotal > 0) ? takenTotal : ''}</td>
            <td>{(pickupTotal > 0) ? pickupTotal : ''}</td>
            <td>{(droppedTotal > 0) ? droppedTotal : ''}</td>
            <td>{(assistTotal > 0) ? assistTotal : ''}</td>
            <td>{(captureTotal > 0) ? captureTotal : ''}</td>
            <td>{(coverTotal > 0) ? coverTotal : ''}</td>
            <td>{(killTotal > 0) ? killTotal : ''}</td>
            <td>{(returnTotal > 0) ? returnTotal : ''}</td>
            <td>{(saveTotal > 0) ? saveTotal : ''}</td>

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