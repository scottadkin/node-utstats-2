import styles from './MatchSummary.module.css';
import MatchResult from '../MatchResult/';
import { convertTimestamp, toPlaytime } from '../../api/generic.mjs';
import MatchPermLink from '../MatchPermLink';


const MatchSummary = ({info, server, gametype, map, bMonsterHunt, settings, host}) =>{

    if(info === undefined){

        return (<div className="default-header">
            Match doesn&apos;t exist.
        </div>);
    }

    if(info.email === '') info.email = 'Not specified';

    let mutatorsElem = null;

    if(settings["Display Mutators"] === "true"){
        if(info.mutators.length > 0){
            mutatorsElem = <div className={styles.mutators}>
                <span className="white">Mutators: </span>
                {info.mutators.replace(/,/ig, ', ')}
            </div>
        }
    }


    let targetScoreElem = null;

    if(settings["Display Target Score"] === "true"){
        targetScoreElem = (info.target_score !== 0) ? <div><span className="white">Target Score</span> {info.target_score}</div> : null;
    }

    let timeLimitElem = null;

    if(settings["Display Time Limit"] === "true"){
        timeLimitElem = (info.time_limit !== 0) ? <div><span className="white">Time Limit</span> {info.time_limit} Minutes</div> : null;
    }

    return (
        <div className={`${styles.wrapper} center`}>
            <div className={styles.map}>

                <MatchResult teamGame={info.team_game} dmWinner={info.dmWinner} dmScore={info.dm_score} totalTeams={info.total_teams}
                redScore={Math.floor(info.team_score_0)} blueScore={Math.floor(info.team_score_1)} greenScore={Math.floor(info.team_score_2)} 
                yellowScore={Math.floor(info.team_score_3)} bMonsterHunt={bMonsterHunt} endReason={info.end_type}/>
                <span className="white">{gametype}</span> {(info.insta) ? '(Instagib)' : ''} on <span className="white">{map}</span><br/>
                <span className={styles.small}>{server}</span><br/>
            
                <span className={styles.small}>{convertTimestamp(info.date, false)}</span><br/>
                {targetScoreElem}
                {timeLimitElem}

                <span className="white">Match Length</span> {toPlaytime(info.playtime)}<br/>
                <span className="white">Players</span> {info.players}<br/>

                {mutatorsElem}

            </div>
            <MatchPermLink hash={info.match_hash} url={`${host}/match/`}/>
        </div>
    );
}


export default MatchSummary;