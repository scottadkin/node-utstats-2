import React from 'react';
import Functions from '../../../api/functions';

class MatchKillsMatchUp extends React.Component{

    constructor(props){

        super(props);

        this.state = {"player1": 0, "player2": 1};

        this.changePlayer = this.changePlayer.bind(this);
    }

    changePlayer(e){

        if(e.target.id == "player_0"){
            this.setState({"player1": parseInt(e.target.value)});
        }else{
            this.setState({"player2": parseInt(e.target.value)});
        }
    }

    getPlayerData(matchId){

        for(const [key, value] of Object.entries(this.props.players)){

            if(value.matchId === matchId) return value;
        }

        return {"name": "Not Found", "team": 255, "country": "", "matchId": -1, "pid": -1}
    }

    getKills(player1, player2){

        let d = 0;

        for(let i = 0; i < this.props.data.length; i++){

            d = this.props.data[i];

            if(d.killer === player1 && d.victim === player2){
                return d.kills;
            }
        }

        return 0;

    }

    createPlayerDropDown(id){

        const value = (id === 0) ? this.state.player1 : this.state.player2;

        const options = [];

        for(const [key, value] of Object.entries(this.props.players)){
 
            options.push(<option key={key} value={value.matchId}>{value.name}</option>);
        }

        return <select className="default-select" id={`player_${id}`} value={value} onChange={this.changePlayer}>
            {options}
        </select>
    }
   
    renderMatchUp(){

        const player1 = this.getPlayerData(this.state.player1);
        const player2 = this.getPlayerData(this.state.player2);


        const player1Kills = this.getKills(player1.matchId, player2.matchId);
        const player2Kills = this.getKills(player2.matchId, player1.matchId);

        const teamColor = (this.props.teams >= 2) ? Functions.getTeamColor(player1.team) : "team-none";
        const teamColor2 = (this.props.teams >= 2) ? Functions.getTeamColor(player2.team) : "team-none";

        return <tr>
            <td className={`width-150 ${teamColor}`}>
                {this.createPlayerDropDown(0)}
            </td>
            <td className="width-50">{player1Kills}</td>
            <td>-</td>
            <td className="width-50">{player2Kills}</td>
            <td className={`width-150 ${teamColor2}`}>{this.createPlayerDropDown(1)}</td>
        </tr>
    }

    render(){

        return <div className="m-bottom-25">
            <div className="default-header">Kills Match Up</div>

            <table className="t-width-2">
                <tbody>
                    <tr>
                        <th colSpan={2}>Player 1</th>
                        <th>VS</th>
                        <th colSpan={2}>Player 2</th>
                    </tr>
                    {this.renderMatchUp()}
                </tbody>
            </table>
        </div>
    }
}

export default MatchKillsMatchUp;