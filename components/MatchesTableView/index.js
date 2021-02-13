import Link from 'next/link';
import TimeStamp from '../TimeStamp/';
import MMSS from '../MMSS/';
import Functions from '../../api/functions';
import MatchResultSmall from '../MatchResultSmall/';

class MatchesTableView extends React.Component{

    constructor(props){
        super(props);
    }


    createRows(){

        const rows = [];

        const matches = JSON.parse(this.props.data);

        let m = 0;

        let url = "";


        for(let i = 0; i < matches.length; i++){

            m = matches[i];

            url = `/match/${m.id}`;

            rows.push(<tr key={`matches-row-${i}`}>
                <td><Link href={url}><a>{m.serverName}</a></Link></td>
                <td><TimeStamp timestamp={m.date} /></td>
                <td>{m.gametypeName}</td>
                <td>{m.mapName}</td>
                <td>{m.players}</td>
                <td><MMSS timestamp={m.playtime} /></td>
                <td><MatchResultSmall 
                    totalTeams={m.total_teams} 
                    dmWinner={m.dm_winner} 
                    dmScore={m.dm_score} 
                    redScore={m.team_score_0}
                    blueScore={m.team_score_1}
                    greenScore={m.team_score_2}
                    yellowScore={m.team_score_3}/>
                </td>
            </tr>);

        }

        return rows;
    }

    render(){

        const rows = this.createRows();



        return (
            <div className="special-table">
                <table>
                    <tbody>
                        <tr>
                            <th>Server</th>
                            <th>Date</th>
                            <th>Gametype</th>
                            <th>Map</th>               
                            <th>Players</th>
                            <th>Playtime</th>
                            <th>Result</th>
                        </tr>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
}


export default MatchesTableView;