import styles from './MatchItemPickups.module.css';
import Functions from '../../api/functions';
import React from 'react';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';

class MatchItemPickups extends React.Component{

    constructor(props){

        super(props);
        this.state = {"catSelected": 1,"selected": this.getFirstTypeIndex(1)};

        this.changeTab = this.changeTab.bind(this);
        this.changeCatTab = this.changeCatTab.bind(this);
    }

    changeTab(id){

        this.setState({"selected": id});
    }

    changeCatTab(id){
        this.setState({"catSelected": id});
        this.setState({"selected": this.getFirstTypeIndex(id)});
    }

    getFirstTypeIndex(type){

        let p = 0;

        for(let i = 0; i < this.props.names.length; i++){

            p = this.props.names[i];

            if(p.type === type){
                return i;
            }
        }

        return -1;
    }

    createCategoryTabs(){

        const elems = [];

        const types = ["Unsorted", "Weapons", "Ammo", "Health/Armour", "Powerups", "Special"];

        let style = "";

        for(let i = 0; i < types.length; i++){

            style = styles.tab2;

            if(this.state.catSelected === i){
                style = `${styles.tab2} ${styles.selected}`;
            }
            
            elems.push(<div onClick={(() =>{
                this.changeCatTab(i);
            })} className={style}>{types[i]}</div>);
        }
  


        return elems;
    }

    createTabs(){

        const elems = [];

        let p = 0;

        let style = "";
        let index = 0;

        for(let i = 0; i < this.props.names.length; i++){

            p = this.props.names[i];

            if(p.type === this.state.catSelected){

                style = styles.tab;

                if(i === this.state.selected || (this.state.selected === 0 && index === 0)){
                    style = `${styles.tab} ${styles.selected}`;
                }

                index++;

                elems.push(<div onClick={(() =>{
                    this.changeTab(i);
                })} className={style}>{p.name}</div>);
                
            }
        }


        return elems;
    }


    getPlayer(id){

        let p = 0;

        for(let i = 0; i < this.props.players.length; i++){

            p = this.props.players[i];

            if(id === p.id){
                return p;
            }
        }
        return {"name": "Not Found", "id": -1, "country": "xx"};
    }

    getCurrentData(){
        

        if(this.props.names[this.state.selected] === undefined){
            return <div>No Data</div>;
        }

        const elems = [];

        const weaponId = this.props.names[this.state.selected].id;

        let p = 0;

        const data = this.props.data;

        data.sort((a,b) =>{

            a = a.uses;
            b = b.uses;

            if(a > b){
                return -1;
            }else if(a < b){
                return 1;
            }

            return 0;
        });

        let player = 0;

        let bgColor = "team-none";

        for(let i = 0; i < data.length; i++){

            p = data[i];

            if(p.item === weaponId){

                player = this.getPlayer(p.player_id);

                if(this.props.bTeamGame){
                    bgColor = Functions.getTeamColor(player.team)
                }

                elems.push(<tr className={bgColor}>
                    <td><CountryFlag country={player.country}/><Link href={`/player/${player.id}`}><a>{player.name}</a></Link></td>
                    <td>{p.uses}</td>
                </tr>);
            }
        }


        if(elems.length > 0){

            return <table>
                <tbody>
                    <tr>
                        <th>
                            Player
                        </th>
                        <th>
                            Uses
                        </th>
                    </tr>
                    {elems}
                </tbody>
            </table>
        }

        return <div>No Data</div>
    }

    render(){

        const parentTabs = this.createCategoryTabs();
        const tabs = this.createTabs();

        const currentData = this.getCurrentData();

        return <div><div className={styles.wrapper}>
            <div className="default-header">Pickup history</div>
            <div className={`${styles.tabs} m-bottom-10`}>{parentTabs}</div>
            <div className={styles.tabs}>{tabs}</div>
            {currentData}
        </div></div>
    }
}

export default MatchItemPickups;