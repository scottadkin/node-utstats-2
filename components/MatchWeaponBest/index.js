import styles from "./MatchWeaponBest.module.css";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import {getTeamColor} from "../../api/generic.mjs";


const BestPlayerElem = ({matchId, data, type, player}) =>{

    let elem = <>N/A</>;

    if(data[type] > 0){

        elem = <>
            <CountryFlag country={player.country}/>
            <Link href={`/pmatch/${matchId}?player=${player.id}`}>{player.name}</Link>
        </>;
    }

    return elem;
}

const MatchWeaponBest = ({matchId, name, bestKills, bestDamage, totalTeams}) =>{

    if(bestKills.data.kills === 0 && bestDamage.data.damage === 0) return null;

    const killPlayerElem = <BestPlayerElem matchId={matchId} data={bestKills.data} player={bestKills.player} type="kills"/>
    const damagePlayerElem = <BestPlayerElem matchId={matchId} data={bestDamage.data} player={bestDamage.player} type="damage"/>
    

    return <div className={styles.wrapper}>
        <div className={styles.name}>
            {name}
        </div>
        <div className={styles.box}>
            <table>
                <tbody>
                <tr>
                        <td>Most Kills</td>
                        <td>{bestKills.data.kills}</td>
                        <td className={getTeamColor((bestKills.data.kills > 0) ? bestKills.player.team : 255, totalTeams)}>
                            {killPlayerElem}
                        </td>
                    </tr>
                    <tr>
                        <td>Most Damage</td>
                        <td>{bestDamage.data.damage}</td>
                        <td className={getTeamColor((bestDamage.data.damage > 0) ? bestDamage.player.team : 255, totalTeams)}>
                            {damagePlayerElem}
                        </td>
                    </tr>
          
                </tbody>
            </table>
        </div>
    </div>
}

export default MatchWeaponBest;