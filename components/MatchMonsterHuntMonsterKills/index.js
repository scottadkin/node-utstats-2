import React from 'react';
import styles from './MatchMonsterHuntMonsterKills.module.css';
import Loading from '../Loading';
import Notifcation from '../Notification';
import MonsterHuntMonster from '../MonsterHuntMonster';

class MatchMonsterHuntMonsterKills extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "bLoading": true, 
            "error": null, 
            "displayErrorUntil": 0,
            "monsterNames": {}, 
            "monsterTotals": [],
            "playerKills": [],
            "monsterImages": [],
            "playerNames": {},
            "currentMonster": 0,
            "mode": 0
        };

        this.changeMonster = this.changeMonster.bind(this);
        this.changeMode = this.changeMode.bind(this);

    }

    changeMode(id){

        this.setState({"mode": id});
    }

    changeMonster(monster){

        this.setState({"currentMonster": monster});
    }

    setFirstMonster(){

        const keys = Object.keys(this.state.monsterNames);

        if(keys.length === 0) return;

        this.setState({"currentMonster": parseInt(keys[0])});
    }

    async loadData(){

        try{

            const req = await fetch("/api/monsterhunt", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "fullmatch", "matchId": this.props.matchId})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({
                    "bLoading": false,
                    "monsterNames": res.monsterNames,
                    "monsterTotals": res.monsterTotals,
                    "playerKills": res.playerKills,
                    "monsterImages": res.monsterImages
                });

                this.setFirstMonster();

                

            }else{

                this.setState({"error": res.error, "displayErrorUntil": Math.floor(Date.now() * 0.001) + 5});
            }

        }catch(err){
            console.trace(err);
        }

    }

    async componentDidMount(){

        await this.loadData();

        const playerNames = {};

        for(let i = 0; i < this.props.playerData.length; i++){

            const p = this.props.playerData[i];

            playerNames[p.player_id] = {"name": p.name, "country": "xx"};

        }

        this.setState({"playerNames": playerNames});
        
    }

    getMonsterName(id, bClassName){

        if(bClassName === undefined) bClassName = false;

        if(this.state.monsterNames[id] !== undefined){

            if(!bClassName){
                return this.state.monsterNames[id].displayName;
            }else{
                return this.state.monsterNames[id].className;
            }
        }

        return "Not Found!";
    }

    getPlayerMonsterKills(monsterId){

        const found = [];

        for(let i = 0; i < this.state.playerKills.length; i++){

            const p = this.state.playerKills[i];

            if(p.monster === monsterId){

                const player = this.state.playerNames[p.player] ?? null;

                if(player !== null){
                    p.playerName = player.name;
                    p.country = player.country;
                }

                found.push(p);
            }
        }

        return found;
    }

    renderMonsters(){

        const monsters = [];

        for(let i = 0; i < this.state.monsterTotals.length; i++){

            const m = this.state.monsterTotals[i];

            if(this.state.mode === 0){

                if(m.monster !== this.state.currentMonster) continue;
            }

            const monsterImage = this.state.monsterImages[this.getMonsterName(m.monster, true)];

            monsters.push(
                <MonsterHuntMonster 
                    key={i} 
                    name={this.getMonsterName(m.monster)} 
                    image={monsterImage} 
                    playerNames={this.state.playerNames}
                    data={this.getPlayerMonsterKills(m.monster)}
                    matchId={this.props.matchId}
                    bHide0Kills={this.state.mode === 0}
                />
            );
        }

        return monsters;
    }

    renderMonsterTabs(){

        if(this.state.mode !== 0) return null;

        const tabs = [];

        const monsterNames = [];

        for(const [key, value] of Object.entries(this.state.monsterNames)){

            value.id = parseInt(key);
            monsterNames.push(value);
        }

        monsterNames.sort((a, b) =>{

            a = a.displayName.toLowerCase();
            b = b.displayName.toLowerCase();

            if(a < b){
                return -1;
            }else if(a > b){
                return 1;
            }
            return 0;
        });


        for(let i = 0; i < monsterNames.length; i++){

            const m = monsterNames[i];

            tabs.push(
                <div key={i} className={`tab ${(this.state.currentMonster === parseInt(m.id)) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMonster(m.id);
                })}>
                    {m.displayName}
                </div>
            );
        }
        

        return <div className="tabs">
            {tabs}
        </div>
    }

    render(){

        let elems = <Loading />;

        if(!this.state.bLoading){

            elems = this.renderMonsters();

        } 

        let notification = (this.state.error !== null) ? 
        <Notifcation type="error" displayUntil={this.state.displayErrorUntil}>{this.state.error}</Notifcation> 
        : 
        null;




        return <>
            <div className="default-header">Monster Stats</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>Single Display</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);
                })}>Display All</div>
            </div>
            {this.renderMonsterTabs()}
            <div className={styles.wrapper}>
                {elems}
            </div>
            {notification}
        </>
    }
}


export default MatchMonsterHuntMonsterKills;