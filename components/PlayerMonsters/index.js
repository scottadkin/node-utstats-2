import React from 'react';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';
import PlayerMonster from '../PlayerMonster';
import styles from "./PlayerMonsters.module.css";

class PlayerMonsters extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "bLoading": true,
            "data": null,
            "error": null
        };
    }

    async loadData(){

        try{

            const req = await fetch("/api/monsterhunt", {
                "method": "POST",
                "headers": {"Content-type": "application/json"},
                "body": JSON.stringify({"mode": "playerTotals","playerId": this.props.playerId})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({"data": res});

            }else{

                this.setState({"error": res.error});
            }

            this.setState({"bLoading": false});

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        await this.loadData();
    }

    getMonsterKills(id){

        for(let i = 0; i < this.state.data.totals.length; i++){

            const d = this.state.data.totals[i];

            if(d.monster === id){
                return {"kills": d.kills, "matches": d.matches, "deaths": d.deaths};
            }
        }

        return {"kills": 0, "matches": 0, "deaths": 0};
    }

    getImage(className){

        if(this.state.data.monsterImages[className] !== undefined){
            return this.state.data.monsterImages[className];
        }

        return "default.png";
    }

    render(){

        const elems = [];

        if(this.state.bLoading){

            elems.push(<Loading key="loading"/>);

        }else{

            if(this.state.error !== null){

                const errorText = this.state.error;
                elems.push(<ErrorMessage key="error" title={"Monster Stats"} text={errorText}/>);

            }

            if(this.state.data !== null){

                const orderedMonsterByNames = [];

                for(const [key, value] of Object.entries(this.state.data.monsterNames)){

                    const data = value;
                    data.id = parseInt(key);

                    orderedMonsterByNames.push(data);
                }

                orderedMonsterByNames.sort((a, b) =>{

                    a = a.displayName.toLowerCase();
                    b = b.displayName.toLowerCase();

                    if(a < b) return -1;
                    if(a > b) return 1;
                    return 0;

                });

                const monsterElems = [];

                for(let i = 0; i < orderedMonsterByNames.length; i++){

                    const m = orderedMonsterByNames[i];
                    const monsterStats = this.getMonsterKills(m.id);

                    monsterElems.push(<PlayerMonster key={i} stats={monsterStats} image={this.getImage(m.className)} 
                        name={m.displayName}
                    />);
                }

                elems.push(
                    <div key="mw" className={styles.monsters}>{monsterElems}</div>);

            }

        }

       

        return <>
            <div className="default-header">Monster Stats</div>
            {elems}
        </>
    }
}

export default PlayerMonsters;