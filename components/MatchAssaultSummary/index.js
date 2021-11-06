import styles from './MatchAssaultSummary.module.css';
import MMSS from '../MMSS/';
import CountryFlag from '../CountryFlag/';
import Functions from '../../api/functions';
import Table2 from '../Table2';

function getName(objectives, id){

    for(let i = 0; i < objectives.length; i++){

        if(objectives[i].obj_id === id){
            return objectives[i].name;
        }
    }

    return 'Not Found';
}



const MatchAssaultSummary = ({host, players, data, matchStart, attackingTeam, redScore, blueScore, playerNames}) =>{

    players = JSON.parse(players);
    data = JSON.parse(data);
    matchStart = JSON.parse(matchStart);
    playerNames = JSON.parse(playerNames);

    if(data.caps === undefined) return null;

    const elems = [];

    let d = 0;

    let currentPlayer = 0;

    const cappedIds = [];


    for(let i = 0; i < data.caps.length; i++){

        d = data.caps[i];

        
        currentPlayer = Functions.getPlayer(playerNames, d.player);

        cappedIds.push(d.obj_id);

        elems.push(<tr key={`attacked-obj-${i}`}>
            <td className="text-left">{getName(data.objectives, d.obj_id)}</td>
            <td>{(d.bfinal) ? 'True' : ''}</td>
            <td><MMSS timestamp={d.timestamp - matchStart} /></td>
            <td className={Functions.getTeamColor(currentPlayer.team)}><CountryFlag host={host} country={currentPlayer.country}/>{currentPlayer.name}</td>

        </tr>);
    }

    for(let i = 0; i < data.objectives.length; i++){

        d = data.objectives[i];

        if(cappedIds.indexOf(d.obj_id) === -1){
            elems.push(
                <tr key={`defended-obj-${i}`} className={Functions.getTeamColor((attackingTeam === 0) ? 1 : 0)}>
                    <td className="text-left">{d.name}</td>
                    <td></td>
                    <td></td>
                    <td>Defended Successfully</td>
                </tr>
            );
        }
    }

    let resultTitle = '';
    let resultColor = 'team-none';

    if(attackingTeam === 0){
        //resultTitle = 'Red Attacking';
        if(redScore > blueScore){
            resultTitle = "Red Captured the base.";
            resultColor = "team-red";
        }else{
            resultTitle = "Blue Defended the base.";
            resultColor = "team-blue";
        }

    }else{

        if(blueScore > redScore){
            resultTitle = "Blue Captured the base.";
            resultColor = "team-blue";
        }else{
            resultTitle = "Red Defended the base.";
            resultColor = "team-red";
        }
    }

    return (
        <div className="special-table m-bottom-25">
            <div className="default-header">
                Assault Summary
            </div>

            <div className={`${styles.attacking} t-width-1 center`}>
                <div className="team-red">{(attackingTeam === 0) ? 'Attacking' : 'Defending'}</div>
                <div className="team-blue">{(attackingTeam === 1) ? 'Attacking' : 'Defending'}</div>
            </div>
            <div className={`${resultColor} ${styles.result} t-width-1 center`}>
                {resultTitle}
            </div>
            {(elems.length === 0) ? null :
            <Table2 width={1}>
                <tr>
                    <th>Objective</th>
                    <th>Final Objective</th>
                    <th>Captured Time</th>
                    <th>Captured By</th>
                    
                </tr>
                {elems}
            </Table2>}
        </div>
    );
}


export default MatchAssaultSummary;