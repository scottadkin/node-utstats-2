import styles from './MatchCTFCapSimple.module.css';
import CountryFlag from '../CountryFlag';

const MatchCTFCap = ({covers, drops, selfCovers, carryTime, grabPlayer, capPlayer, host, dropTime}) =>{

    return <div className={styles.wrapper}>
        <div className={styles.event}>
            Flag Taken by {grabPlayer.name}
        </div>
        <div className={styles.box}>
            <div className={styles.title}>Time Carried</div>
            <div className={styles.image}>
                <img src="/images/playerwithflagclock.png" alt="image"/>
            </div>
            <div className={styles.value}>{carryTime} Seconds</div>
        </div>
        <div className={styles.box}>
            <div className={styles.title}>Covers</div>
            <div className={styles.image}>
                <img src="/images/flagcover.png" alt="image"/>
            </div>
            <div className={styles.value}>{covers}</div>
        </div>
        <div className={styles.box}>
            <div className={styles.title}>Kills Carrying Flag</div>
            <div className={styles.image}>
                <img src="/images/playerwithflag.png" alt="image"/>
            </div>
            <div className={styles.value}>{selfCovers}</div>
        </div>
        <div className={styles.box}>
            <div className={styles.title}>Times Dropped</div>
            <div className={styles.image}>
                <img src="/images/flagdropped.png" alt="image"/>
            </div>
            <div className={styles.value}>{drops}</div>
        </div>
        <div className={styles.box}>
            <div className={styles.title}>Time Dropped</div>
            <div className={styles.image}>
                <img src="/images/flagdroppedtime.png" alt="image"/>
            </div>
            <div className={styles.value}>{dropTime.toFixed(2)} Seconds</div>
        </div>
    </div>
}

export default MatchCTFCap;