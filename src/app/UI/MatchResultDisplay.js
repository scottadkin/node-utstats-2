import styles from './MatchResultDisplay.module.css';
import Link from 'next/link';
import { toPlaytime } from '../../../api/generic.mjs';

function getPlayerResultColor(playerResult){

    const string = playerResult.toLowerCase();

    if(string === "won the match"){
        return "green";
    }else if(string === "lost the match"){
        return "red";
    }

    return "yellow";
}

function reduceNameLength(name){

    const maxLength = 45;

    if(name.length > maxLength){

        const shortName = name.slice(0,maxLength);

        return `${shortName}...`;
    }

    return name;
}

function renderPlayerResult(mode, players, serverName, gametypeName, mapName, playerResult, playtime, date, mapImage){

    if(mode !== "player") return null;

    const resultColor = getPlayerResultColor();

    return <div>
        <div className={styles.presult} style={{"color": resultColor}}>
            {playerResult}
        </div>
        
        <div className={styles.mapi}>
            <img className="thumb-sshot" src={mapImage}  alt="image"/>
        </div>
        <div className={styles.sinfo}>
            {reduceNameLength(serverName)}<br/>
        </div>
        <div className={styles.mapn}>
            {mapName}
        </div>
        <div className={styles.minfo}>
            {gametypeName}<br/>
            {date}<br/>
            {toPlaytime(playtime)}<br/>
            {players} Players
        </div>
    </div>;

}

function renderRecentResult(mode, players, serverName, gametypeName, mapName, playtime, date, mapImage){

    if(mode !== "recent") return null;

    return <div>
        <div className={styles.mapt}>
            {mapName}
        </div>
        <div className={styles.mapi}>
            <img className="thumb-sshot" src={mapImage} alt="image"/>
        </div>
        <div className={styles.sinfo}>
            {reduceNameLength(serverName)}<br/>
        </div>
        <div className={styles.minfo}>
            {gametypeName}<br/>
            {date}<br/>
            {toPlaytime(playtime)}<br/>
            {players} Players
        </div>
    </div>;

}


export default function MatchResultDisplay({children, url, mode, playerResult, mapImage, mapName, serverName, date, gametypeName, playtime, players}){

    return <Link href={url}>
        
        <div className={styles.wrapper}>
            {renderPlayerResult(mode, players, serverName, gametypeName, mapName, playerResult, playtime, date, mapImage)}
            {renderRecentResult(mode, players, serverName, gametypeName, mapName, playtime, date, mapImage)}
            {children}
        </div>
    
    </Link>
}
