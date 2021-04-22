import styles from './MatchSummary.module.css';
import TimeStamp from '../TimeStamp/';
import Playtime from '../Playtime/';
import MatchResult from '../MatchResult/';



const ServerSetting = ({label, value}) =>{

    return (<div className={styles.setting}>
        <span className="yellow">{label} </span>
        {value}
    </div>);
}

const MatchSummary = ({info, server, gametype, map, image}) =>{

    if(info === undefined){

        return (<div className="default-header">
            Match doesn't exist.
        </div>);
    }

    info = JSON.parse(info);


    const motd = info.motd.split('\n');

    console.log(motd);

    if(info.email === '') info.email = 'Not specified';

    let mutatorsElem = null;

    if(info.mutators.length > 0){
        mutatorsElem = <div>
            <span className="yellow">Mutators: </span>
            {info.mutators.replace(/,/ig, ', ')}
        </div>
    }

    let motdElem = null;

    if(motd.length > 0){

        const motdStrings = [];

        for(let i = 0; i < motd.length; i++){

            if(motd[i] !== ""){
                motdStrings.push(<div className={styles.motd} key={i}>"{motd[i]}"</div>);
            }
        }

        if(motdStrings.length > 0){
            motdElem = <div className={styles.motdw}>
                <span className="yellow">MOTD</span>
                {motdStrings}
            </div>
        }
    }

    const targetScoreElem = (info.target_score !== 0) ? <div><span className="yellow">Target Score</span> {info.target_score}</div> : null;
    const timeLimitElem = (info.time_limit !== 0) ? <div><span className="yellow">Time Limit</span> {info.time_limit}</div> : null;

    return (
        <div className={`${styles.wrapper} center`}>
            <div className={styles.map}>
                <MatchResult teamGame={info.team_game} dmWinner={info.dm_winner} dmScore={info.dm_score} totalTeams={info.total_teams}
                redScore={Math.floor(info.team_score_0)} blueScore={Math.floor(info.team_score_1)} greenScore={Math.floor(info.team_score_2)} 
                yellowScore={Math.floor(info.team_score_3)} />
                <TimeStamp key={info.date} timestamp={info.date}/><br/>
                <span className="yellow">{server}</span><br/>
                <span className="yellow">{gametype} {(info.insta) ? '(Instagib)' : ''}</span> on <span className="yellow">{map}</span><br/>
                {targetScoreElem}
                {timeLimitElem}

                <span className="yellow">Match Length</span> <Playtime seconds={info.playtime} /><br/>
                <span className="yellow">Players</span> {info.players}<br/>

                {mutatorsElem}

                {motdElem}

            </div>
        </div>
    );
}


export default MatchSummary;