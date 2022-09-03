import React from 'react';
import styles from './MatchMonsterHuntMonsterKills.module.css';
import Loading from '../Loading';
import Notifcation from '../Notification';
import MonsterHuntMonster from '../MonsterHuntMonster';
import MatchPlayerMonster from '../MatchPlayerMonster';

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

        const monsterNames = this.monstersOrderedByName();

        if(monsterNames.length > 0){

            this.setState({"currentMonster": monsterNames[0].id});
        }
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

        if(this.props.playerId === undefined){

            for(let i = 0; i < this.props.playerData.length; i++){

                const p = this.props.playerData[i];

                playerNames[p.player_id] = {"name": p.name, "country": "xx"};

            }

        }else{

            playerNames[this.props.playerId] = this.props.playerData;

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

        const playerId = this.props.playerId ?? null;

        for(let i = 0; i < this.state.playerKills.length; i++){

            const p = this.state.playerKills[i];

            if(p.monster === monsterId){

                const player = this.state.playerNames[p.player] ?? null;

                if(playerId !== null && p.player !== playerId){
                    continue;
                }
                
                if(player !== null){
                    p.playerName = player.name;
                    p.country = player.country;
                }

               
                found.push(p);

            }
        }

        return found;
    }

    getSinglePlayerMonsterStats(playerId, monsterId){

        let kills = 0;
        let deaths = 0;


        for(let i = 0; i < this.state.playerKills.length; i++){

            const k = this.state.playerKills[i];

            if(k.player === playerId && k.monster === monsterId){
                return {"kills": k.kills, "deaths": k.deaths};
            }

        }

        return {"kills": kills, "deaths": deaths}
    }

    renderMonsters(){

        const monsters = [];

        for(let i = 0; i < this.state.monsterTotals.length; i++){

            const m = this.state.monsterTotals[i];

            //skip not found monsters
            if(m.monster === -1) continue;

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
                    bPlayerMatch={this.props.playerId !== undefined}
                />
            );
        }

        return monsters;
    }

    monstersOrderedByName(){

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

        return monsterNames;

    }

    renderMonsterTabs(){

        if(this.state.mode !== 0) return null;

        const tabs = [];

        const monsterNames = this.monstersOrderedByName();


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
        

        return <div className="tabs" key="tabs">
            {tabs}
        </div>
    }

    renderMatchMonsters(){

        return <div>
            <div className="tabs" key="main-tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>Single Display</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);
                })}>Display All</div>
            </div>
            {this.renderMonsterTabs()}
            <div key="w" className={styles.wrapper}>
            {this.renderMonsters()}
            </div>
            
        </div>
    }
    
    renderPlayerMatchMonsters(){


        const monsterNames = this.monstersOrderedByName();
        const elems = [];

        for(let i = 0; i < monsterNames.length; i++){

            const m = monsterNames[i];

            const monsterImage = this.state.monsterImages[this.getMonsterName(m.id, true)];

            const stats = this.getSinglePlayerMonsterStats(this.props.playerId, m.id);

            if(stats.kills === 0 && stats.deaths === 0) continue;

            elems.push(<MatchPlayerMonster key={m.id} monster={m} image={monsterImage} stats={stats}/>);
        }

        return <div>
            {elems}
        </div>
    }

    render(){

        let elems = <Loading />;

        if(!this.state.bLoading){

            if(this.props.playerId === undefined){

                elems = this.renderMatchMonsters();
            }else{

                elems = this.renderPlayerMatchMonsters();
            }

        } 

        let notification = (this.state.error !== null) ? 
        <Notifcation type="error" displayUntil={this.state.displayErrorUntil}>{this.state.error}</Notifcation> 
        : 
        null;




        return <>
            <div className="default-header">Monster Stats</div>
            
            {elems}
            {notification}
        </>
    }
}


export default MatchMonsterHuntMonsterKills;