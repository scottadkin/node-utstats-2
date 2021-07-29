import React from "react";
import Functions from '../../../api/functions';


class MatchesList extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        const elems = [];


        let d = 0;

        for(let i = 0; i < this.props.data.length; i++){

            d = this.props.data[i];

            elems.push(<tr key={i}>
                <td>{Functions.convertTimestamp(Functions.utDate(d.time), true)}</td>
                <td>{d.gamename}</td>
                <td>{Functions.removeUnr(d.mapfile)}</td>
                <td>{Functions.MMSS(d.gametime)}</td>
                <td>{d.players}</td>
            </tr>);
        }

        return <div>
            <div className="default-header">
                {this.props.title}
            </div>

            <table className="t-width-1">
                <tbody>
                    <tr>
                        <th>Date</th>
                        <th>Gametype</th>
                        <th>Map</th>
                        <th>Playtime</th>
                        <th>Players</th>
                    </tr>
                    {elems}
                </tbody>
            </table>
            
        </div>
    }
}

export default MatchesList;