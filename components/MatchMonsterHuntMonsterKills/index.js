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
            "playerNames": {}
        };


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

            const monsterImage = this.state.monsterImages[this.getMonsterName(m.monster, true)];

            monsters.push(
                <MonsterHuntMonster 
                    key={i} 
                    name={this.getMonsterName(m.monster)} 
                    image={monsterImage} 
                    playerNames={this.state.playerNames}
                    data={this.getPlayerMonsterKills(m.monster)}
                    matchId={this.props.matchId}
                />
            );
        }

        return monsters;
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
            <div className={styles.wrapper}>
                {elems}
            </div>
            {notification}
        </>
    }
}


export default MatchMonsterHuntMonsterKills;