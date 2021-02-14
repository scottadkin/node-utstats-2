import Link from 'next/link';
import Timestamp from '../TimeStamp/';
import styles from './PlayerRecentMatches.module.css';
import Playtime from '../Playtime/';
import Pagination from '../Pagination/';

const getMatchScores = (scores, id) =>{

    for(let i = 0; i < scores.length; i++){

        if(scores[i].id === id){
            return scores[i];
        }
    }

    return null;
}

const PlayerRecentMatches = ({playerId, matches, scores, gametypes, totalMatches, matchPages, currentMatchPage, matchesPerPage}) =>{

    matches = JSON.parse(matches);
    scores = JSON.parse(scores);

    gametypes = JSON.parse(gametypes);
    
    const elems = [];

    let m = 0;

    let currentClassName = "";
    let currentScore = "";
    let scoreElems = [];
    let currentWinnerClass = "";
    let currentGametype = 0;

    for(let i = 0; i < matches.length; i++){

        m = matches[i];

        currentScore = getMatchScores(scores, m.match_id);

        scoreElems = [];

        if(currentScore.team_game){

            switch(currentScore.total_teams){
                case 2: {   currentClassName = "duo";  } break;
                case 3: {   currentClassName = "trio"; } break;
                case 4: {   currentClassName = "quad"; } break;
                default: { currentClassName = "solo";  } break;
            }

            for(let i = 0; i < currentScore.total_teams; i++){

                scoreElems.push(
                    <div key={`score_elems_${i}`}>
                        {currentScore[`team_score_${i}`]}
                    </div>
                );
            }

            if(currentScore.total_teams === 0){
                scoreElems.push(
                    <div key={`score_elems_none`}>
                        Not Found
                    </div>
                );
            }

        }else{

            currentClassName = "solo";
            
            scoreElems.push(
                <div key={`score_elems_solo`}>
                    {(currentScore.dm_winner !== '') ? currentScore.dm_winner : 'Not Found' } ({currentScore.dm_score})
                </div>
            );
        }


        currentWinnerClass = (m.winner) ? "green" : (m.draw) ? "Draw" : "red";

        currentGametype = gametypes[currentScore.gametype];

        if(currentGametype === undefined){
            currentGametype = 'Not Found';
        }else if(currentGametype === null){
            currentGametype = 'Not Found';
        }

        elems.push(
            <Link key={m.id} href={`/match/${m.match_id}`}>
                <a>
                    <div className={styles.default} style={{"backgroundImage": `url('../images/maps/stalwartxl.jpg')`, "backgroundSize": "100% 100%"}}>
                        <div className={styles.inner}>
                            <div className={styles.info}>
                                <div className={`${currentWinnerClass} ${styles.winner}`}>
                                    { (m.winner) ? "Winner" : (m.draw) ? "Draw" : "Lost"}
                                </div>
                                <Timestamp key={i} timestamp={m.match_date} />    
                                <div className="yellow">
                                    {currentGametype}
                                </div>    
                                <div className="yellow">
                                    {m.mapName}
                                </div>
                                <div>Played <Playtime key={i} seconds={m.playtime} /></div>
                                
                                <div className={currentClassName}>
                                    {scoreElems}
                                </div>
                            </div>
                        </div>
                    </div>
                    </a>
                </Link>
            
        );
    }

    return (
        <div  id="recent-matches">
        <div className="default-header" >
            Recent Matches
        </div>
        <Pagination 
                currentPage={currentMatchPage}
                results={totalMatches}
                pages={matchPages}
                perPage={matchesPerPage}
                url={`/player/${playerId}?matchpage=`}
                anchor={'#recent-matches'}
                
            />
        
            {elems}    
        </div>
    );
}


export default PlayerRecentMatches;