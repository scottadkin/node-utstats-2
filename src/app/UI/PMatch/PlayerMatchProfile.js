import styles from "./PlayerMatchProfile.module.css";
import Link from 'next/link';
import Image from "next/image";

export default function PlayerMatchProfile({data, matchId, playerId}){

    let country = data.country;

    if(country === "") country = "xx";

    return <div>
        <Link href={`/player/${playerId}`}>  
            <div className={`${styles.wrapper} center m-bottom-10`}>
                Click to View <Image className={styles.flag} height={14} width={22} src={`/images/flags/${country.toLowerCase()}.svg`} alt="flag"/> 
                <b> {data.name}{(data.name[data.name.length - 1] == "s") ? "'" : "'s"}</b> Career Profile.       
            </div>   
        </Link>
        <Link href={`/match/${matchId}`}>
            <div className={`${styles.wrapper} center m-bottom-10`}>
                Click to View Full Match Report  
            </div>      
        </Link>
    </div>
}
