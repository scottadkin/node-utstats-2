import React from 'react';
import MatchWeapon from '../MatchWeapon/';
import styles from './MatchWeaponSummary.module.css';
import CleanDamage from '../CleanDamage';



class MatchWeaponSummary extends React.Component{

    constructor(props){

        super(props);

        this.state = {"tabs": []};

        this.changeTab = this.changeTab.bind(this);

        
    }

    componentDidMount(){

        this.createTabs();
    }

    createTabs(){

        //console.table(this.props.data);

        const tabs = [];
        let weapon = 0;

        for(let i = 0; i < this.props.data.names.length; i++){

            weapon = this.props.data.names[i];
            tabs.push({"name": weapon.name, "id": weapon.id});

        }

        this.setState({"tabs": tabs, "selected": 0});
    
    }

    changeTab(id){

        this.setState({"selected": id});
    }

    getTabs(){

        const elems = [];

        let t = 0;
        let style = "";

        for(let i = 0; i < this.state.tabs.length; i++){

            t = this.state.tabs[i];

            if(this.state.selected === i){
                style = `${styles.tab} ${styles.selected}`;
            }else{
                style = styles.tab;
            }

            elems.push(<div onClick={(() =>{
                this.changeTab(i);
            })} className={style}>{t.name}</div>);
        }

        return elems;
    }

    getPlayerName(){
        console.log(this.props.players);
    }


    bAnyData(data){

        const types = ["kills","deaths","accuracy","shots","hits","damage"];

        for(let i = 0; i < types.length; i++){

            if(data[types[i]] > 0)  return true;
        }

        return false;
    }

    getDataElems(){

        const id = this.state.tabs[this.state.selected].id;

        console.log(`id = ${id}`);


        const elems = [];


        let p = 0;
        for(let i = 0; i < this.props.data.playerData.length; i++){

            p = this.props.data.playerData[i];

            if(p.weapon_id === id){
                if(this.bAnyData(p)){
                    elems.push(
                        <tr>
                            <td>Player</td>
                            <td>{p.shots}</td>
                            <td>{p.hits}</td>
                            <td>{p.accuracy}%</td>
                            <td>{p.deaths}</td>
                            <td>{p.kills}</td>
                            <td><CleanDamage damage={p.damage} /></td>
                        </tr>
                    );
                }
            }
        }

        if(elems.length > 0){

            return <table>
                <tbody>
                    <tr>
                        <th>Player</th>
                        <th>Shots</th>
                        <th>Hits</th>
                        <th>Accuracy</th>
                        <th>Deaths</th>
                        <th>Kills</th>
                        <th>Damage</th>
                    </tr>
                    {elems}
                </tbody>
            </table>
        }

        return elems;
    }

    render(){

        const tabs = this.getTabs();

        let dataElems = [];

        if(this.state.selected !== undefined){
            dataElems = this.getDataElems();
        }

        return <div>
            <div className="default-header">Weapon Statistics</div>
            {tabs}
            {dataElems}
        </div>
    }
}


export default MatchWeaponSummary;