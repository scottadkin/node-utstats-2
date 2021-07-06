import React from 'react';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';



class MatchMonsterHuntFragSummary extends React.Component{


    constructor(props){

        super(props);
    }

    renderTable(){

        const rows = [];

        let p = 0;

        for(let i = 0; i < this.props.playerData.length; i++){

            p = this.props.playerData[i];

            rows.push(<tr key={i}>
                {(this.props.single !== undefined) ? null : <td className="team-none text-left">
                    <Link href={`/pmatch/${this.props.matchId}/?player=${p.player_id}`}><a><CountryFlag country={p.country}/>{p.name}</a></Link>
                </td>}
                <td>{Functions.MMSS(p.playtime - this.props.matchStart)}</td>
                <td>{Functions.ignore0(p.team_kills)}</td>
                <td>{Functions.ignore0(p.deaths + p.suicides)}</td>
                <td>{Functions.ignore0(p.mh_kills)}</td>
                <td>{Functions.ignore0(p.mh_kills_best_life)}</td>
                <td>{Functions.ignore0(p.score)}</td>
            </tr>);
        }

        return <table className="t-width-1 td-1-150">
            <tbody>
                <tr>
                    {(this.props.single !== undefined) ? null : <th>Player</th>}
                    <th>Playtime</th>
                    <th>Team Kills</th>
                    <th>Deaths</th>
                    <th>Monster Kills</th>
                    <th>Most Kills In a Life</th>
                    <th>Score</th>
                </tr>
                {rows}
            </tbody>
        </table>
    }

    render(){
        return <div className="m-bottom-25">
            <div className="default-header">Frag Summary</div>
            {this.renderTable()}
        </div>
    }
}


export default MatchMonsterHuntFragSummary;