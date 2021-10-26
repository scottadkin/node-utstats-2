import Link from 'next/link';
import TimeStamp from '../TimeStamp/';
import MMSS from '../MMSS/';
import MatchResultSmall from '../MatchResultSmall/';
import React from 'react';

class MatchesTableView extends React.Component{

    constructor(props){
        super(props);
    }


    getMatchResult(matchData){

        const scores = [];
        const myScore = matchData[`team_score_${matchData.playersTeam}`]

        for(let i = 0; i < matchData.total_teams; i++){

            scores.push(matchData[`team_score_${i}`]);
        }

        scores.sort((a, b) =>{

            if(a > b) return -1;
            else if(a < b) return 1;
            return 0;
        });

        //draws
        if(scores[0] === scores[1]){
            if(scores[0] === myScore) return -1;
        }

        if(scores[0] > myScore) return 0;

        return 1;

    }


    createRows(matches){

        const rows = [];    

        for(let i = 0; i < matches.length; i++){

            const m = matches[i];

            const url = `/match/${m.id}`;

            let resultElem = null;

            if(m.playersTeam !== undefined){

                const result = this.getMatchResult(m);

                let string = "Lost the Match!";
                let colorClass = "team-red";

                if(result === 1){
                    string = "Won the Match!";
                    colorClass = "team-green";
                }else if(result === -1){
                    string = "Drew the match!";
                    colorClass = "team-yellow";
                } 

                resultElem = <td className={colorClass}>{string}</td>;
            }

            // <td><Link href={url}><a>{m.serverName}</a></Link></td>
            rows.push(<tr key={`matches-row-${i}`}>
               
                <td><Link href={url}><a><TimeStamp timestamp={m.date} noDayName={true}/></a></Link></td>
                <td><Link href={url}><a>{m.gametypeName}</a></Link></td>
                <td><Link href={url}><a>{m.mapName}</a></Link></td>
                <td><Link href={url}><a>{m.players}</a></Link></td>
                <td><Link href={url}><a><MMSS timestamp={m.playtime} /></a></Link></td>
                <td className="padding-0"><MatchResultSmall 
                    totalTeams={m.total_teams} 
                    dmWinner={m.dm_winner} 
                    dmScore={m.dm_score} 
                    redScore={Math.floor(m.team_score_0)}
                    blueScore={Math.floor(m.team_score_1)}
                    greenScore={Math.floor(m.team_score_2)}
                    yellowScore={Math.floor(m.team_score_3)}
                    bMonsterHunt={m.mh}
                    endReason={m.end_type}
                    />
                </td>
                {resultElem}
            </tr>);

        }

        return rows;
    }

    render(){

        const matches = JSON.parse(this.props.data);

        const rows = this.createRows(matches);

        if(matches.length === 0){
            return null;//;(<div className="not-found">There are no matches meeting your search requirements.</div>);
        }


        return (
            <div className="center">
                <table className="t-width-1">
                    <tbody>
                        <tr>
                            <th>Date</th>
                            <th>Gametype</th>
                            <th>Map</th>               
                            <th>Players</th>
                            <th>Playtime</th>
                            <th>Result</th>
                            {(matches[0].playersTeam !== undefined) ? <th>Players Result</th> : null}
                        </tr>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
}


export default MatchesTableView;