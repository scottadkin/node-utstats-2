const WON_ELEM = <span className="green">Won the match</span>;
const DRAW_ELEM = <span className="yellow">Drew the match</span>;
const LOST_ELEM = <span className="red">Lost the match</span>;

function getTeamScores(data){

    const teamScores = [];

    for(let i = 0; i < data.total_teams; i++){
        teamScores.push({"id": i, "score": data[`team_score_${i}`]});
    }

    teamScores.sort((a, b) =>{

        a = a.score;
        b = b.score;

        if(a > b) return -1;
        if(a < b) return 1;
        return 0;
    });


    return teamScores;
}

export default function PlayerMatchResult({playerId, data}){


    if(data.dm_winner !== 0 && data.dm_winner === playerId){
        return WON_ELEM;
    }

    if(data.total_teams >= 2){

        const teamScores = getTeamScores(data);

        const winningTeam = teamScores[0].id;
        const winningScore = teamScores[0].score;

        let teamsWithWinningScore = [];

        for(let i = 0; i < teamScores.length; i++){

            if(teamScores[i].score === winningScore){
                teamsWithWinningScore.push(teamScores[i].id);
            }
        }

        if(teamsWithWinningScore.length === 1 && winningTeam === data.team){
            return WON_ELEM;
        }

        if(teamsWithWinningScore.length > 1 && teamsWithWinningScore.indexOf(data.team) !== -1){
            return DRAW_ELEM;
        }

        return LOST_ELEM;

    }

    if(data.mh){
        const end = data.end_type.toLowerCase();
        if(end === "hunt successful!") return WON_ELEM;
        return LOST_ELEM;
    }

    return <span className="red">{data.end_type}</span>;
}