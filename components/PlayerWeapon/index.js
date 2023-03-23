import styles from './PlayerWeapon.module.css';
import PlayerWeaponStat from '../PlayerWeaponStat/';
import Functions from '../../api/functions';
import Image from 'next/image';

const PlayerWeapon = ({name, image, stats, maxValues}) =>{

    return <div className={styles.wrapper}>
        <div className={styles.name}>{name}</div>
        <div className={styles.image}>
            <Image src={`/images/weapons/${image}.png`} width={195} height={140} alt="image" />
        </div>
        <div className={styles.stats}>
            {(stats.matches === undefined) ? null : <PlayerWeaponStat name="Matches" display={stats.matches} value={stats.matches} max={maxValues.matches}/>}
            <PlayerWeaponStat name="Kills" display={stats.kills} value={stats.kills} max={maxValues.kills}/>
            <PlayerWeaponStat name="Deaths" display={stats.deaths} value={stats.deaths} max={maxValues.deaths}/>
            <PlayerWeaponStat name="EFF" display={`${stats.efficiency}%`} value={stats.efficiency} max={maxValues.efficiency}/>
            <PlayerWeaponStat name="Shots" display={stats.shots} value={stats.shots} max={maxValues.shots}/>
            <PlayerWeaponStat name="Hits" display={stats.hits} value={stats.hits} max={maxValues.hits}/>
            <PlayerWeaponStat name="Accuracy" display={`${stats.accuracy.toFixed(2)}%`} value={stats.accuracy} max={maxValues.accuracy}/>
            <PlayerWeaponStat name="Damage" display={Functions.cleanDamage(stats.damage)} value={stats.damage} max={maxValues.damage}/>
        </div>
    </div>;
}

export default PlayerWeapon;