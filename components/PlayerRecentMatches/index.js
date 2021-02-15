import Link from 'next/link';
import TimeStamp from '../TimeStamp/';
import styles from './PlayerRecentMatches.module.css';
import Pagination from '../Pagination/';
import Functions from '../../api/functions';
import Image from 'next/image';
import MMSS from '../MMSS/';
import MatchResult from '../MatchResult/';

const getMatchScores = (scores, id) =>{

    for(let i = 0; i < scores.length; i++){

        if(scores[i].id === id){
            return scores[i];
        }
    }

    return null;
}

function getMapImage(maps, name){

    name = Functions.removeMapGametypePrefix(name.toLowerCase());

    const index = maps.indexOf(name);

    if(index !== -1){
        return `/images/maps/${maps[index]}.jpg`;
    }

    return '/images/defaultmap.jpg';
}

function getServerName(servers, id){

    if(servers[id] !== undefined){
        return servers[id];
    }
    return 'Not Found';
}

const PlayerRecentMatches = ({playerId, matches, scores, gametypes, totalMatches, matchPages, currentMatchPage, matchesPerPage, mapImages, serverNames}) =>{

    matches = JSON.parse(matches);
    scores = JSON.parse(scores);

    gametypes = JSON.parse(gametypes);
    mapImages = JSON.parse(mapImages);

    serverNames = JSON.parse(serverNames);

    const elems = [];

    let m = 0;

    let currentScore = "";
    let currentWinnerClass = "";
    let currentGametype = 0;
    let mapImage = 0;
    let currentServerName = "";

    for(let i = 0; i < matches.length; i++){

        m = matches[i];

        currentScore = getMatchScores(scores, m.match_id);


        currentWinnerClass = (m.winner) ? "green" : (m.draw) ? "Draw" : "red";

        currentGametype = gametypes[currentScore.gametype];

        if(currentGametype === undefined){
            currentGametype = 'Not Found';
        }else if(currentGametype === null){
            currentGametype = 'Not Found';
        }

        mapImage = getMapImage(mapImages, m.mapName);


        elems.push(<Link href={`/match/${m.match_id}`} key={m.id}><a>
            <div className={styles.wrapper}>
                <div className={`${styles.title} ${currentWinnerClass}`}> 
                    { (m.winner) ? "Won the Match" : (m.draw) ? "Drew the Match" : "Lost the Match"}
                </div>
                <div className={styles.image}>
                    <Image width={480} height={270} src={mapImage} />
                </div>
                <div className={styles.info}>
                    <span className="yellow">{getServerName(serverNames, m.server)}</span><br/>
                    <span className="yellow">{currentGametype}</span> on <span className="yellow">{m.mapName}</span><br/>
                    <TimeStamp timestamp={m.match_date} /><br/>
                    Playtime <span className="yellow"><MMSS timestamp={m.playtime}/></span><br/>
                    Players <span className="yellow">{m.players}</span>
                </div>
                <MatchResult dmWinner={currentScore.dm_winner} dmScore={currentScore.dm_score} totalTeams={currentScore.total_teams} 
                redScore={currentScore.team_score_0} blueScore={currentScore.team_score_1} greenScore={currentScore.team_score_2} yellowScore={currentScore.team_score_3} />
            </div>
        </a></Link>);
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