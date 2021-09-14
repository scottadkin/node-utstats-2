import React from 'react';
import styles from './MatchKillsMatchUpAlt.module.css';
import Functions from '../../api/functions';

class MatchKillsMatchUpAlt extends React.Component{

    constructor(props){

        super(props);
        this.state = {"data": [], "player1": -1, "player2": -1};

        this.setSelectedPlayer = this.setSelectedPlayer.bind(this);
    }

    setSelectedPlayer(player, id){

        id = parseInt(id);

        if(player === 1) this.setState({"player1": id});
        if(player === 2) this.setState({"player2": id});

    }

    getNextPlayer(ignore){

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i].id;

            if(p !== ignore) return p;
        }

        return -1;
    }

    getPlayerTeam(id){

        if(this.props.totalTeams < 2) return 255;
        
        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            if(p.id === id) return p.team;
        }

        return 255;
    }

    async componentDidMount(){

        try{

            const req = await fetch("/api/kills", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "matchupalt", "id": this.props.matchId})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState(
                    {
                        "data": res.data,
                        "player1": (res.data[0] !== undefined) ? res.data[0].killer : -1,
                        "player2": (res.data[1] !== undefined) ? res.data[1].killer : -1
                    });
                
            }else{

                console.trace(res.error);
            }

        }catch(err){
            console.trace(err);
        }
    }


    getKillCount(killer, victim){


        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            if(d.killer === killer && d.victim === victim) return d.kills;
        }

        return 0;
    }

    createPlayerDropDown(id){

        const options = [];

        let otherValue = (id === 1) ? this.state.player2 : this.state.player1;

        const players = this.props.players;

        players.sort((a, b) =>{

            a = a.name;
            b = b.name;

            if(a > b){
                return 1;
            }else if(a < b){
                return -1;
            }

            return 0;
        });

        for(let i = 0; i < players.length; i++){

            const p = players[i];
            
            if(otherValue !== p.id){

                if(p.played){
                    options.push(<option key={i} value={p.id}>{p.name}</option>);
                }
            }

        }

        return <select className="default-select" value={this.state[`player${id}`]} onChange={((e) =>{
            this.setSelectedPlayer(id, e.target.value)
        })}>
            {options}
        </select>
    }


    render(){

        return <div>
            <div className="default-header">Kills Match Up</div>
            <div className={`${styles.wrapper} center`}>
                <div className={Functions.getTeamColor(this.getPlayerTeam(this.state.player1))}>{this.createPlayerDropDown(1)}</div>
                <div>{this.getKillCount(this.state.player1, this.state.player2)}</div>
                <div>-</div>
                <div>{this.getKillCount(this.state.player2, this.state.player1)}</div>
                <div className={Functions.getTeamColor(this.getPlayerTeam(this.state.player2))}>{this.createPlayerDropDown(2)}</div>
            </div>
            
        </div>
    }

}

export default MatchKillsMatchUpAlt;