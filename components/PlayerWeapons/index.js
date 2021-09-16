
import styles from './PlayerWeapons.module.css';
import PlayerWeapon from '../PlayerWeapon/';
import React from 'react';
import Functions from '../../api/functions';



class PlayerWeapons extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": (this.props.pageSettings["Default Weapon Display"] !== undefined) ?  
        parseInt(this.props.pageSettings["Default Weapon Display"])
        : 0};

        this.changeMode = this.changeMode.bind(this);
    }   

    componentDidMount(){

        const settings = this.props.session;

        if(settings["playerPageWeaponsMode"] !== undefined){
            this.setState({"mode": parseInt(settings["playerPageWeaponsMode"])});
        }
    }

    changeMode(id){
        this.setState({"mode": id});
        Functions.setCookie("playerPageWeaponsMode", id);
    }

    getWeaponName(names, id){

        for(let i = 0; i < names.length; i++){
    
            if(names[i].id === id){
                return names[i].name;
            }
        }
    
        return "Not Found";
    }
    
    getWeaponImage(images, name){
    
        name = name.toLowerCase();
        name = name.replace(/\s/ig,'');
    
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


    getWeaponData(stats, weapon){
        
        for(let i = 0; i < stats.length; i++){

            if(stats[i].weapon === parseInt(weapon)){
                return stats[i];
            }
        }

        return null;
    }
    
    setMaxValues(stats){
    
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

    render(){

        const weaponStats = JSON.parse(this.props.weaponStats);
        const weaponNames = JSON.parse(this.props.weaponNames);
        const weaponImages = JSON.parse(this.props.weaponImages);

        const maxValues = this.setMaxValues(weaponStats);

        let elems = [];

        let currentName = "";
        let currentImage = 0;

        let w = 0;

        if(this.state.mode === 0){

            for(let i = 0; i < weaponStats.length; i++){

                w = weaponStats[i];
                currentName = this.getWeaponName(weaponNames, w.weapon);
                
                currentImage = this.getWeaponImage(weaponImages, currentName);
                
                elems.push(<PlayerWeapon key={i} name={currentName} image={currentImage} stats={w} maxValues={maxValues}/>);
            }

        }else{

            let subElems = [];

            let currentWeaponStats = 0;
            

            for(const [key, value] of Object.entries(weaponNames)){

                currentWeaponStats = this.getWeaponData(weaponStats, value.id);

                if(currentWeaponStats !== null){
                    elems.push(
                        <tr key={key}>
                            <td>{value.name}</td>
                            <td>{Functions.ignore0(currentWeaponStats.kills)}</td>
                            <td>{Functions.ignore0(currentWeaponStats.deaths)}</td>
                            <td>{Functions.ignore0(currentWeaponStats.shots)}</td>
                            <td>{Functions.ignore0(currentWeaponStats.hits)}</td>
                            <td>{Functions.ignore0(currentWeaponStats.damage)}</td>
                            <td>{currentWeaponStats.accuracy.toFixed(2)}%</td>
                            <td>{currentWeaponStats.efficiency}%</td>
                            <td>{currentWeaponStats.matches}</td>

                        </tr>
                    );
                }
            }

            //if(elems.length > 0){

                elems = <table className="t-width-1 td-1-left">
                    <tbody>
                        <tr>
                            <th>Weapon</th>
                            <th>Kills</th>
                            <th>Deaths</th>
                            <th>Shots</th>
                            <th>Hits</th>
                            <th>Damage</th>
                            <th>Accuracy</th>
                            <th>Efficiency</th>
                            <th>Matches</th>
                        </tr>
                        {elems}
                    </tbody>
                </table>
            //}
        }

        if(this.state.mode === 0){

            elems = <div className="m-top-15">
                {elems}
            </div>
        }

        return (
            <div>
                <div className="default-header">Weapon Stats</div>
                <div className={`${styles.main} m-bottom-10`}>
                    
                    <div className="tabs">
                        <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                            this.changeMode(0);
                        })}>Default View</div>
                        <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`}
                        onClick={(() =>{
                            this.changeMode(1);
                        })}>Compressed View</div>
                    </div>
                    {elems}
                </div>
            </div>
        );
    }
}

export default PlayerWeapons;