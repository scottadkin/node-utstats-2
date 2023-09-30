import styles from "./MatchWeaponBest.module.css";
import CountryFlag from "../CountryFlag";
import Link from "next/link";

const MatchWeaponBest = ({matchId, name, bestKills, bestDamage}) =>{

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
                        <td>
                            <CountryFlag country={bestKills.player.country}/>
                            <Link href={`/pmatch/${matchId}?player=${bestKills.player.id}`}>{bestKills.player.name}</Link>
                        </td>
                    </tr>
                    <tr>
                        <td>Most Damage</td>
                        <td>{bestDamage.data.damage}</td>
                        <td>
                            <CountryFlag country={bestDamage.player.country}/>
                            <Link href={`/pmatch/${matchId}?player=${bestDamage.player.id}`}>{bestDamage.player.name}</Link>
                        </td>
                    </tr>
          
                </tbody>
            </table>
        </div>
    </div>
}

export default MatchWeaponBest;