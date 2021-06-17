import React from 'react';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';

class MatchSprees extends React.Component{

    constructor(props){

        super(props);
    }


    renderTable(){


        const rows = [];

        const ms = this.props.matchStart;

        let s = 0;
        let player = 0;
        let killer = 0;

        let endReason = "";

        for(let i = 0; i < this.props.data.length; i++){

            s = this.props.data[i];

            player = Functions.getPlayer(this.props.players, s.player);

            if(s.killer !== -1){

                if(s.killer !== s.player){
                    killer = Functions.getPlayer(this.props.players, s.killer);
                    endReason = <span>Killed by <Link href={`/player/${s.killer}`}><a><CountryFlag country={killer.country}/>{killer.name}</a></Link></span>
                }else{
                    endReason = "Suicide";
                }


            }else{
                endReason = "Match ended.";
            }

            rows.push(<tr key={i}>
                <td className="text-left"><Link href={`/player/${s.player}`}><a><CountryFlag country={player.country} />{player.name}</a></Link></td>
                <td>{Functions.MMSS(s.start_timestamp - ms)}</td>
                <td>{Functions.MMSS(s.end_timestamp - ms)}</td>
                <td>{endReason}</td>
                <td>{Functions.MMSS(s.total_time)}</td>
                <td>{s.kills}</td>
            </tr>);
        }

        return <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Player</th>
                    <th>Started</th>
                    <th>Ended</th>
                    <th>End Reason</th>
                    <th>Spree lifetime</th>
                    <th>KIlls</th>
                </tr>
                {rows}
            </tbody>
        </table>

    }

    render(){

        return <div className="m-bottom-25">
            <div className="default-header">Extended Sprees Information</div>
            {this.renderTable()}
        </div>
    }
}

export default MatchSprees;