import Link from 'next/link';
import MatchResultSmall from './MatchResultSmall';
import { convertTimestamp, removeUnr, toPlaytime } from "../../../api/generic.mjs";
import { BasicTable } from "../UI/Tables/Tables";

function getMatchResult(matchData){

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


function createRows(matches){

    const rows = [];    

    for(let i = 0; i < matches.length; i++){

        const m = matches[i];

        const url = `/match/${m.id}`;

        let resultElem = null;

        if(m.playersTeam !== undefined){

            const result = getMatchResult(m);

            let string = "Lost the Match!";
            let colorClass = "team-red";

            if(result === 1){
                string = "Won the Match!";
                colorClass = "team-green";
            }else if(result === -1){
                string = "Drew the match!";
                colorClass = "team-yellow";
            } 

            resultElem = string;
        }

        // <td><Link href={url}><a>{m.serverName}</a></Link></td>

        const row = [
        <Link href={url}>{convertTimestamp(m.date, true)}</Link>,
        <Link href={url}>{m.gametypeName}</Link>,
        <Link href={url}>{removeUnr(m.mapName)}</Link>,
        <Link href={url}>{m.players}</Link>,
        <Link href={url}>{toPlaytime(m.playtime)}</Link>,
        <MatchResultSmall 
            totalTeams={m.total_teams} 
            dmWinner={m.dmWinner} 
            dmScore={m.dm_score} 
            redScore={Math.floor(m.team_score_0)}
            blueScore={Math.floor(m.team_score_1)}
            greenScore={Math.floor(m.team_score_2)}
            yellowScore={Math.floor(m.team_score_3)}
            bMonsterHunt={m.mh}
            endReason={m.end_type}
        />];

        if(resultElem !== null){
            row.push(resultElem);
        }

        rows.push(row);

    }
    return rows;
}

export default function MatchesTableView({data}){

    const matches = data;

    const rows = createRows(matches);

    if(rows.length === 0){
        rows.push(<tr key="000"><td colSpan={7}>No Data</td></tr>);
    }

    let finalHeader = null;

    if(matches[0] !== undefined){
        
        if(matches[0].playerTeam !== undefined){
            finalHeader = <th>Players Result</th>
        }
    }

    const tableHeaders = [
        "Date", "Gametype", "Map", "Players", "Playtime", "Match Result", finalHeader
    ];

    return <BasicTable 
        width={1} 
        headers={tableHeaders} 
        rows={rows} 
        columnStyles={[null, null, null, null, "playtime", "padding-0", null]}
    />

    
}
