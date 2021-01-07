
import styles from './PlayerWeapons.module.css';

const tempGetWeapon = (id, weaponNames) =>{

    for(let i = 0; i < weaponNames.length; i++){

        if(weaponNames[i].id === id) return weaponNames[i].name;
    }
    return 'Not Found';
}

const tempGetWeaponImage = (files, name) =>{

    name = name.toLowerCase();
    name = name.replace(/ /ig,'');

    if(name === 'doubleenforcers'){
        name = 'enforcer';
    }

    console.log(`looking for ${name}`);

    if(files.indexOf(`${name}.png`) !== -1){
        return `/images/weapons/${name}.png`;
    }

    return `/images/temp.jpg`;

}

const StatsBar = ({label, value}) =>{

    return (
        
            <div>
                <div className={styles.block}>
                    <div>{label}</div>
                    <div className={styles.bar}>
                        <div className={styles.inner}>
                            
                        </div>
                    </div>
                </div>
                <div className={styles.value}>
                        {value}
                </div>
             </div>
        
    );
}

const PlayerWeapons = ({weaponStats, weaponNames, weaponImages}) =>{
    
    weaponStats = JSON.parse(weaponStats);
    weaponNames = JSON.parse(weaponNames);
    weaponImages = JSON.parse(weaponImages);
   
    const tempElems = [];

    let currentName = 0;

    let w = 0;

    for(let i = 0; i < weaponStats.length; i++){

        currentName = tempGetWeapon(weaponStats[i].weapon, weaponNames);

        w = weaponStats[i];

        tempElems.push(
            <div className={styles.wrapper}>
                <div className={styles.image}>
                    <img src={tempGetWeaponImage(weaponImages, currentName)} alt="image"/> 
                </div>
                <div className={styles.stats}>
                    <div className={styles.name}>
                        {currentName}
                    </div>
     
                    <StatsBar  label={"Kills"} value={w.kills}/>
                    <StatsBar  label={"Deaths"} value={w.deaths}/>
                    <StatsBar  label={"Efficiency"} value={`${w.efficiency.toFixed(2)}%`}/>
                    <StatsBar  label={"Shots"} value={w.shots}/>
                    <StatsBar  label={"Hits"} value={w.hits}/>
                    <StatsBar label={"Accuracy"} value={`${w.accuracy.toFixed(2)}%`}/>
                </div>
            </div>
        );

        /*tempElems.push(
            <tr>
                <td>{currentName} <img className="weapon-image" src={`${tempGetWeaponImage(weaponImages, currentName)}`} alt="image"/></td>
                <td>{weaponStats[i].gametype}</td>
                <td>{weaponStats[i].matches}</td>
                <td>{weaponStats[i].kills}</td>
                <td>{weaponStats[i].deaths}</td>
                <td>{weaponStats[i].efficiency}%</td>
                <td>{weaponStats[i].shots}</td>
                <td>{weaponStats[i].hits}</td>
                <td>{weaponStats[i].accuracy}%</td>
                <td>{weaponStats[i].damage}</td>
            </tr>
        );*/
    }
    /*return (
        <div className="special-table">
                <div className="default-header">Weapon Stats</div>
                <table>
                    <tbody>
                        <tr>
                            <th>Weapon</th>
                            <th>Gametype</th>
                            <th>Matches</th>
                            <th>Kills</th>
                            <th>Deaths</th>
                            <th>Efficiency</th>
                            <th>Shots</th>
                            <th>Hits</th>
                            <th>Accuracy</th>
                            <th>Damage</th>
                        </tr>
                        {tempElems}
                    </tbody>
                </table>
            </div>);*/

    return (
        <div>
            {tempElems}
        </div>
    );
}

export default PlayerWeapons;