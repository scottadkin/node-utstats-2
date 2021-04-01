import styles from './PlayerWeaponStat.module.css';

const PlayerWeaponStat = ({name, display, value, max}) =>{

    let percent = 0;

    if(value !== 0){

        if(max === 0){
            percent = 100;
        }else{
            const bit = 100 / max;

            percent = bit * value; 
        }
    }
    
    return <div className={styles.wrapper}>

        <div className={styles.name}>
            {name}
        </div>
        <div className={styles.bar}>
            <div className={styles.ibar} style={{"width": `${percent}%`}}>
                
            </div>
        </div>
        <div className={styles.value}>
            {display}
        </div>
     
    </div>
}

export default PlayerWeaponStat;