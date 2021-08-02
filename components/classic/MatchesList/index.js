import React from "react";
import Functions from '../../../api/functions';
import MatchResult from '../MatchResult';
import Link from 'next/link';
import MatchResultBox from '../../../components/MatchResultBox';


class MatchesList extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 1};
    }


    renderTable(){

        if(this.state.mode !== 0) return null;

        const elems = [];

        let d = 0;

        for(let i = 0; i < this.props.data.length; i++){

            d = this.props.data[i];

            elems.push(<tr key={i}>
                <td><Link href={`/classic/match/${d.id}`}><a>{Functions.convertTimestamp(Functions.utDate(d.time), true)}</a></Link></td>
                <td><Link href={`/classic/match/${d.id}`}><a>{d.gamename}</a></Link></td>
                <td><Link href={`/classic/match/${d.id}`}><a>{Functions.removeUnr(d.mapfile)}</a></Link></td>
                <td><Link href={`/classic/match/${d.id}`}><a>{Functions.MMSS(d.gametime)}</a></Link></td>
                <td><Link href={`/classic/match/${d.id}`}><a>{d.players}</a></Link></td>
                <td className="padding-0"><Link href={`/classic/match/${d.id}`}><a><MatchResult data={d.result}/></a></Link></td>
            </tr>);
        }


        return <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Date</th>
                    <th>Gametype</th>
                    <th>Map</th>
                    <th>Playtime</th>
                    <th>Players</th>
                    <th>Result</th>
                </tr>
                {elems}
            </tbody>
        </table>;

    }


    renderDefault(){

        if(this.state.mode !== 1) return null;

        const elems = [];

        let d = 0;

        for(let i = 0; i < this.props.data.length; i++){

            d = this.props.data[i];

            elems.push(<MatchResultBox key={i} serverName={d.servername} gametypeName={d.gamename} mapName={Functions.removeUnr(d.mapfile)}
            date={Functions.convertTimestamp(Functions.utDate(d.time))} playtime={Functions.MMSS(d.gametime)} players={d.players}
            totalTeams={d.totalTeams} result={d.result} mapImage={d.image} classic={true}/>);
        }

        return elems;

    }

    render(){


        return <div>
            <div className="default-header">
                {this.props.title}
            </div>

            {this.renderTable()}
            {this.renderDefault()}
            
        </div>
    }
}

export default MatchesList;