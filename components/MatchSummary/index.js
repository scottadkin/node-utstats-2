import styles from './MatchSummary.module.css';
import TimeStamp from '../TimeStamp/';
import Playtime from '../Playtime/';
import MatchResult from '../MatchResult/'

const MatchSummary = ({info, server, gametype, map}) =>{

    info = JSON.parse(info);

    console.log(server);
    return (
        <div className={`${styles.wrapper} center`}>
            <div className={styles.map}>
                <div>
                    <img src="/images/maps/stalwartxl.jpg" alt="image"/>
                </div>
                <div>

                    <MatchResult teamGame={info.team_game} dmWinner={info.dm_winner} dmScore={info.dm_score} totalTeams={info.total_teams}
                    redScore={info.team_score_0} blueScore={info.team_score_1} greenScore={info.team_score_2} yellowScore={info.team_score_3} />
                    <TimeStamp timestamp={info.date}/><br/>
                    <span className="yellow">{server}</span><br/>
                    <span className="yellow">{gametype} {(info.insta) ? '(Instagib)' : ''}</span> on <span className="yellow">{map}</span><br/>
                    <span className="yellow">Match Length</span> <Playtime seconds={info.playtime} /><br/>
                    <span className="yellow">Players</span> {info.players}<br/>
                    
                </div>
            </div>
        </div>
    );
}


export default MatchSummary;