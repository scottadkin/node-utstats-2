import Link from 'next/link';
import TimeStamp from '../TimeStamp/';
import MMSS from '../MMSS/'

class MatchesTableView extends React.Component{

    constructor(props){
        super(props);
    }


    createRows(){

        const rows = [];

        const matches = JSON.parse(this.props.data);

        let m = 0;

        for(let i = 0; i < matches.length; i++){

            m = matches[i];

            rows.push(<tr key={`matches-row-${i}`}>
                <td><TimeStamp timestamp={m.date} /></td>
                <td>{m.server}</td>
                <td>{m.map}</td>
                <td>{m.gametype}</td>
                <td>{m.players}</td>
                <td><MMSS timestamp={m.playtime} /></td>
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
                            <th>Date</th>
                            <th>Server</th>
                            <th>Map</th>
                            <th>Gametype</th>
                            <th>Players</th>
                            <th>Playtime</th>
                        </tr>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
}


export default MatchesTableView;