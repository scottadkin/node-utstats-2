import styles from './MatchSummary.module.css';
import TimeStamp from '../TimeStamp/';
import Playtime from '../Playtime/';

const MatchSummary = ({info, gametype, map}) =>{

    info = JSON.parse(info);

    console.log(info);
    return (
        <div className={styles.wrapper}>
            <div className={styles.map}>
                <div>
                    <img src="/images/maps/stalwartxl.jpg" alt="image"/>
                </div>
                <div>
                    <TimeStamp timestamp={info.date}/><br/>
                    <span className="yellow">{gametype} {(info.insta) ? '(Instagib)' : ''}</span> on <span className="yellow">{map}</span><br/>
                    <span className="yellow">Match Length</span> <Playtime seconds={info.playtime} /><br/>
                    <span className="yellow">Players</span> {info.players}<br/>
                    
                </div>
            </div>
        </div>
    );
}


export default MatchSummary;