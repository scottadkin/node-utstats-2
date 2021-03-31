
import styles from './PlayerWeapons.module.css';
import PlayerWeapon from '../PlayerWeapon/';


function getWeaponName(names, id){

    for(let i = 0; i < names.length; i++){

        if(names[i].id === id){
            return names[i].name;
        }
    }

    return "Not Found";
}

function getWeaponImage(images, name){

    console.log(`name was ${name}`);
    name = name.toLowerCase();
    name = name.replace(/\s/ig,'');

    console.log(`name = ${name}`);

    if(name !== 'none' && name !== "notfound"){
        
        name = `${name}.png`;

        for(let i = 0; i < images.length; i++){

            if(name === images[i]){
                return images[i];
            }
        }
    }

    return 'default.png';
}

function setMaxValues(stats){

    const max = {
        "matches": 0,
        "kills": 0,
        "deaths": 0,
        "efficiency": 100,
        "shots": 0,
        "hits": 0,
        "accuracy": 100,
        "damage": 0
    };

    let s = 0;

    for(let i = 0; i < stats.length; i++){

        s = stats[i];

        if(s.matches > max.matches) max.matches = s.matches;
        if(s.kiils > max.kills) max.kills = s.kills;
        if(s.deaths > max.deaths) max.deaths = s.deaths;
        //if(s.efficiency > max.efficiency) max.efficiency = s.efficiency;
        if(s.shots > max.shots) max.shots = s.shots;
        if(s.hits > max.hits) max.hits = s.hits;
        if(s.damage > max.damage) max.damage = s.damage;
        //if(s.accuracy > max.accuracy) max.accuracy = s.accuracy;
    }

    return max;
}

const PlayerWeapons = ({weaponStats, weaponNames, weaponImages}) =>{
    
    weaponStats = JSON.parse(weaponStats);
    weaponNames = JSON.parse(weaponNames);
    weaponImages = JSON.parse(weaponImages);

    const maxValues = setMaxValues(weaponStats);


    //console.log(weaponImages);

   // console.log(weaponStats);



    const elems = [];

    let currentName = "";
    let currentImage = 0;

    let w = 0;

    for(let i = 0; i < weaponStats.length; i++){

        w = weaponStats[i];
        currentName = getWeaponName(weaponNames, w.weapon);
        
        currentImage = getWeaponImage(weaponImages, currentName);
        elems.push(<PlayerWeapon key={i} name={currentName} image={currentImage} stats={w} maxValues={maxValues}/>);
    }

    return (
        <div className={`${styles.main} m-bottom-10`}>
            <div className="default-header">Weapon Stats</div>
            {elems}
        </div>
    );
}

export default PlayerWeapons;