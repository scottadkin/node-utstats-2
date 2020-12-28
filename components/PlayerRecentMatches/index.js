import Link from 'next/link';
import Timestamp from '../TimeStamp/';
import styles from './PlayerRecentMatches.module.css';
import Playtime from '../Playtime/';
//import RecentMatchResult from '../RecentMatchResult/'

const getMapName = (maps, id) =>{

    for(let i = 0; i < maps.length; i++){

        if(maps[i].id === id){
            return maps[i].name;
        }
    }

    return 'Not Found';
}

const getMatchScores = (scores, id) =>{

    for(let i = 0; i < scores.length; i++){

        if(scores[i].id === id){
            return scores[i];
        }
    }

    return null;
}

const PlayerRecentMatches = ({matches, maps, scores, gametypes}) =>{

    matches = JSON.parse(matches);
    maps = JSON.parse(maps);
    scores = JSON.parse(scores);

    //console.log(matches);
   // console.log(maps);
    console.log(scores);

    gametypes = JSON.parse(gametypes);

    console.log(gametypes);


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
                    <div>
                        {currentScore[`team_score_${i}`]}
                    </div>
                );
            }

            if(currentScore.total_teams === 0){
                scoreElems.push(
                    <div>
                        Not Found
                    </div>
                );
            }

        }else{

            currentClassName = "solo";
            
            scoreElems.push(
                <div>
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
                                <Timestamp timestamp={m.match_date} />    
                                <div className="yellow">
                                    {currentGametype}
                                </div>    
                                <div className="yellow">
                                    {getMapName(maps, m.map_id)}
                                </div>
                                <div><Playtime seconds={m.playtime} /></div>
                                
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
        <div>
        <div className="default-header">
            Recent Matches
        </div>
            {elems}      
        </div>
    );
}


export default PlayerRecentMatches;