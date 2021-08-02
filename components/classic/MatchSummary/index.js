import styles from '../../MatchSummary/MatchSummary.module.css';
import Functions from '../../../api/functions';

const MatchSummary = ({date}) =>{

    return <div className={`${styles.wrapper} center`}>
    <div className={styles.map}>

        {Functions.convertTimestamp(date)}<br/>
        <span className="yellow">server</span><br/>
        <span className="yellow">gametype </span> on <span className="yellow">map</span><br/>
        {/*targetScoreElem*/}
        {/*timeLimitElem*/}

        <span className="yellow">Match Length</span> <br/>
        <span className="yellow">Players</span> <br/>

        {/*mutatorsElem*/}

        {/*motdElem*/}

    </div>
</div>
}

export default MatchSummary;