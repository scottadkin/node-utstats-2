import styles from './MatchSummary.module.css';
import TimeStamp from '../TimeStamp/';
import Playtime from '../Playtime/';
import MatchResult from '../MatchResult/';


const MatchSummary = ({info, server, gametype, map, bMonsterHunt, settings}) =>{

    if(info === undefined){

        return (<div className="default-header">
            Match doesn&apos;t exist.
        </div>);
    }

    info = JSON.parse(info);

    if(info.email === '') info.email = 'Not specified';

    let mutatorsElem = null;

    if(settings["Display Mutators"] === "true"){
        if(info.mutators.length > 0){
            mutatorsElem = <div>
                <span className="yellow">Mutators: </span>
                {info.mutators.replace(/,/ig, ', ')}
            </div>
        }
    }


    let targetScoreElem = null;

    if(settings["Display Target Score"] === "true"){
        targetScoreElem = (info.target_score !== 0) ? <div><span className="yellow">Target Score</span> {info.target_score}</div> : null;
    }

    let timeLimitElem = null;

    if(settings["Display Time Limit"] === "true"){
        timeLimitElem = (info.time_limit !== 0) ? <div><span className="yellow">Time Limit</span> {info.time_limit} Minutes</div> : null;
    }

    return (
        <div className={`${styles.wrapper} center`}>
            <div className={styles.map}>
                <MatchResult teamGame={info.team_game} dmWinner={info.dm_winner} dmScore={info.dm_score} totalTeams={info.total_teams}
                redScore={Math.floor(info.team_score_0)} blueScore={Math.floor(info.team_score_1)} greenScore={Math.floor(info.team_score_2)} 
                yellowScore={Math.floor(info.team_score_3)} bMonsterHunt={bMonsterHunt} endReason={info.end_type}/>
                <span className={styles.small}>{server}</span><br/>
                {map}<br/>{gametype} {(info.insta) ? '(Instagib)' : ''}<br/>
                <span className={styles.small}><TimeStamp key={info.date} timestamp={info.date}/></span><br/>
                {targetScoreElem}
                {timeLimitElem}

                <span className="yellow">Match Length</span> <Playtime seconds={info.playtime} /><br/>
                <span className="yellow">Players</span> {info.players}<br/>

                {mutatorsElem}

            </div>
        </div>
    );
}


export default MatchSummary;