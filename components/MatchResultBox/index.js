import styles from './MatchResultBox.module.css';
import MatchResult from '../MatchResult';
import Image from 'next/image';


const MatchResultBox = ({host, serverName, gametypeName, mapName, mapImage, date, players, playtime, totalTeams, result, dmScore, monsterHunt, endReason}) =>{


    let dmWinner = ""; 

    let scores = [0,0,0,0];

    if(Array.isArray(result)){

        for(let i = 0; i < result.length; i++){

            scores[i] = result[i];
        }
    }else{
        dmWinner = result;
    }

    let shortenedName = serverName.slice(0, 65);

    if(serverName !== shortenedName){
        serverName = `${shortenedName}...`;
    }

    return <div className={styles.wrapper}>
        <div className={styles.title}>{mapName}</div>
        <div className={styles.gametype}>{gametypeName}</div>
        <div className={styles.players}>{players} {(players !== 1) ? "Players" : "Player"}</div>
        <div className={styles.image}>
            <Image src={`/images/maps/${mapImage}.jpg`} alt="image" className="map-image" width={1920} height={1080}/>
        </div>
        <div className={`${styles.server} yellow`}>{serverName}</div>
        <div className={styles.date}>{date}</div>
        <div className={styles.playtime}>Playtime {playtime}</div>
        <MatchResult bMonsterHunt={monsterHunt} endReason={endReason} dmWinner={dmWinner} dmScore={(dmScore === undefined) ? null : dmScore} totalTeams={totalTeams} 
            redScore={scores[0]} blueScore={scores[1]} greenScore={scores[2]} yellowScore={scores[3]}/>
    </div>

}


export default MatchResultBox;