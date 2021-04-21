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
            <span className="yellow">Mutators</span><br/>
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

    return (
        <div className={`${styles.wrapper} center`}>
            <div className={styles.map}>
                
                    
                    <MatchResult teamGame={info.team_game} dmWinner={info.dm_winner} dmScore={info.dm_score} totalTeams={info.total_teams}
                    redScore={Math.floor(info.team_score_0)} blueScore={Math.floor(info.team_score_1)} greenScore={Math.floor(info.team_score_2)} 
                    yellowScore={Math.floor(info.team_score_3)} />
                    <TimeStamp key={info.date} timestamp={info.date}/><br/>
                    <span className="yellow">{server}</span><br/>
                    <span className="yellow">{gametype} {(info.insta) ? '(Instagib)' : ''}</span> on <span className="yellow">{map}</span><br/>
                    <span className="yellow">Match Length</span> <Playtime seconds={info.playtime} /><br/>
                    <span className="yellow">Players</span> {info.players}<br/>

                    {mutatorsElem}

                    <span className="yellow">Server Settings</span><br/>
                    <div>
                        <ServerSetting key={1} label="Admin" value={`${info.admin}`}/>
                        <ServerSetting key={2} label="Email" value={info.email}/>
                        <ServerSetting key={3} label="Server Version" value={info.version}/>
                        <ServerSetting key={4} label="Min Client Version" value={info.min_version}/>
                        <ServerSetting key={5} label="Max Players" value={info.max_players}/>
                        <ServerSetting key={6} label="Max Spectators" value={info.max_spectators}/>
                        <ServerSetting key={7} label="Target Score" value={info.target_score}/>
                        <ServerSetting key={8} label="Time Limit" value={info.time_limit}/>
                        <ServerSetting key={9} label="Tournament" value={(info.tournament) ? 'True' : 'False'}/>
                        <ServerSetting key={10} label="Game Speed" value={`${info.game_speed}%`}/>
                        <ServerSetting key={11} label="Air Control" value={`${info.air_control * 100}%`}/>
                        <ServerSetting key={12} label="Use Translocator" value={(info.use_translocator) ? 'True' : 'False'}/>
                        <ServerSetting key={13} label="Friendly Fire Scale" value={`${info.friendly_fire_scale * 100}%`}/>
                        <ServerSetting key={14} label="Match End Reason" value={info.end_type}/>
                    </div>
                    {motdElem}

            </div>
        </div>
    );
}


export default MatchSummary;