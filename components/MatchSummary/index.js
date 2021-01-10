import styles from './MatchSummary.module.css';
import TimeStamp from '../TimeStamp/';
import Playtime from '../Playtime/';
import MatchResult from '../MatchResult/';


const ServerSetting = ({label, value, bEnd}) =>{

    

    return (<div className={styles.setting}>
        <span className="yellow">{label} </span>
        {value}{(bEnd === undefined) ? ',' : ''}
    </div>);
}

const MatchSummary = ({info, server, gametype, map, image}) =>{

    info = JSON.parse(info);

    console.log(info);

    if(info.email === '') info.email = 'Not specified';

    return (
        <div className={`${styles.wrapper} center`}>
            <div className={styles.map}>
                
                    
                    <MatchResult teamGame={info.team_game} dmWinner={info.dm_winner} dmScore={info.dm_score} totalTeams={info.total_teams}
                    redScore={info.team_score_0} blueScore={info.team_score_1} greenScore={info.team_score_2} yellowScore={info.team_score_3} />
                    <TimeStamp timestamp={info.date}/><br/>
                    <span className="yellow">{server}</span><br/>
                    <span className="yellow">{gametype} {(info.insta) ? '(Instagib)' : ''}</span> on <span className="yellow">{map}</span><br/>
                    <span className="yellow">Match Length</span> <Playtime seconds={info.playtime} /><br/>
                    <span className="yellow">Players</span> {info.players}<br/>

                    <img className={styles.mimage} src={`${image}`} alt="image"/><br/>
                    <span className="yellow">Mutators</span><br/>
                    <span className={styles.mutators}>{info.mutators.replace(/,/ig, ', ')}</span><br/>

                    <span className="yellow">Server Settings</span><br/>

                    <ServerSetting label="Admin" value={`${info.admin}`}/>
                    <ServerSetting label="Email" value={info.email}/>
                    <ServerSetting label="Server Version" value={info.version}/>
                    <ServerSetting label="Min Client Version" value={info.min_version}/>
                    <ServerSetting label="Max Players" value={info.max_players}/>
                    <ServerSetting label="Max Spectators" value={info.max_spectators}/>
                    <ServerSetting label="Target Score" value={info.target_score}/>
                    <ServerSetting label="Time Limit" value={info.time_limit}/>
                    <ServerSetting label="Tournament" value={(info.tournament) ? 'True' : 'False'}/>
                    <ServerSetting label="Game Speed" value={`${info.game_speed}%`}/>
                    <ServerSetting label="Air Control" value={`${info.air_control * 100}%`}/>
                    <ServerSetting label="Use Translocator" value={(info.use_translocator) ? 'True' : 'False'}/>
                    <ServerSetting label="Friendly Fire Scale" value={`${info.friendly_fire_scale * 100}%`}/>
                    <ServerSetting label="Match End Reason" value={info.end_type}/>
                    <ServerSetting label="MOTD" value={info.motd} bEnd={1}/>


                    
                    
    
            </div>
        </div>
    );
}


export default MatchSummary;