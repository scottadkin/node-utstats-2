import styles from "./MatchPlayerViewProfile.module.css";
import Link from 'next/link';

const MatchPlayerViewProfile = ({data, matchId}) =>{

    return <div>
        <Link href={`/player/${data.player_id}`}>
            <a>
                <div className={`${styles.wrapper} center m-bottom-25`}>
            
                    Click to View <img className={styles.flag} src={`/images/flags/${data.country}.svg`} alt="flag"/> 
                    <b> {data.name}{(data.name[data.name.length - 1] == "s") ? "'" : "'s"}</b> Carrer Profile.
                
                </div>
            </a>
        </Link>

        <Link href={`/match/${matchId}`}>
            <a>
                <div className={`${styles.wrapper} center m-bottom-25`}>
            
                    Click to View Full Match Report
                
                </div>
            </a>
        </Link>
    </div>
}

export default MatchPlayerViewProfile;