import styles from './MatchSummary.module.css';
import MatchResult from '../MatchResult';
import { convertTimestamp, toPlaytime } from '../../../../api/generic.mjs';
import MatchPermLink from './MatchPermLink';


export default function MatchSummary({info, bPlayerPage, settings}){

    if(bPlayerPage === undefined) bPlayerPage = false;

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

                <MatchResult 
                    teamGame={info.team_game} 
                    dmWinner={info.dmWinnerName} 
                    dmScore={info.dm_score} 
                    totalTeams={info.total_teams}
                    redScore={Math.floor(info.team_score_0)} 
                    blueScore={Math.floor(info.team_score_1)} 
                    greenScore={Math.floor(info.team_score_2)} 
                    yellowScore={Math.floor(info.team_score_3)} 
                    bMonsterHunt={info.mh} 
                    endReason={info.end_type}
                    bIncludeImages={true}
                />
                <span className="white">{info.gametypeName}</span> {(info.insta) ? '(Instagib)' : ''} on <span className="white">{info.mapName}</span><br/>
                <span className={styles.small}>{info.serverName}</span><br/>
            
                <span className={styles.small}>{convertTimestamp(info.date, false)}</span><br/>
                {targetScoreElem}
                {timeLimitElem}

                <span className="white">Match Length</span> {toPlaytime(info.playtime)}<br/>
                <span className="white">Players</span> {info.players}<br/>

                {mutatorsElem}

            </div>
            {(!bPlayerPage) ? <MatchPermLink hash={info.match_hash}/> : null}
        </div>
    );
}