import React from 'react';
import styles from './AdminMatchControl.module.css';
import CountryFlag from '../CountryFlag/';


class AdminMatchControl extends React.Component{

    constructor(props){

        super(props);

        this.deleteMatch = this.deleteMatch.bind(this);
        this.deletePlayer = this.deletePlayer.bind(this);

        this.state = {"players": JSON.parse(this.props.players),"matchDeleteMessage": "", "playerDeleteMessages": []};
    }

    async deleteMatch(){

        try{

            const req = await fetch("/api/adminmatches", {
                "headers": {"Content-Type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "delete", "id": this.props.matchId})
            });

            const result = await req.json();

            this.setState({"matchDeleteMessage": result.message});

            setTimeout(() =>{
                window.location = "/";
            }, 2000);
            

        }catch(err){
            console.trace(err);
        }   
    }

    displayMatchDeletedMessage(){

        if(this.state.matchDeleteMessage === "") return null;

        let string = this.state.matchDeleteMessage;

        if(string === "passed"){
            string = "Match Deleted successfully. Redirecting in 2 seconds.";
        }

        return <div className={`team-green ${styles.box} center m-bottom-25`}>
            {string}
        </div>
    }


    async deletePlayer(playerId){

        try{

            console.log(playerId);

            const req = await fetch("/api/matchadmin", {
                "headers": {"Content-Type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({
                    "type": "deletePlayer", 
                    "matchId": this.props.matchId,
                    "playerId": playerId,
                    "mapId": this.props.mapId})
            });

            const result = await req.json();

            if(result.message === "passed"){

                this.updatePlayerList(playerId);
            }

        }catch(err){
            console.trace(err);
        }
    }

    updatePlayerList(id){

        let p = 0;

        const newPlayers = [];

        for(let i = 0; i < this.state.players.length; i++){

            p = this.state.players[i];

            if(p.id !== id){
                newPlayers.push(p);
            }else{

                const messages = this.state.playerDeleteMessages;

                messages.push(`Player ${p.name} was deleted successfully.`);

                this.setState({"playerDeleteMessages": messages});
            }
        }

        this.setState({"players": newPlayers});
    }

    displayPlayerOptions(){

        const players = this.state.players;

        const rows = [];

        let p = 0;

        const createButton = (id) =>{
            return <div className={`${styles.button} team-red`} onClick={(() =>{
                this.deletePlayer(id);
            })}>Remove From Match</div>
        }

        for(let i = 0; i < players.length; i++){

            p = players[i];

            rows.push(<tr key={i}>
                <td><CountryFlag host={this.props.host} country={p.country}/>{p.name}</td>
                <td>
                    {createButton(p.id)}
                </td>
            </tr>);
        }

        const messages = [];

        let m = 0;

        for(let i = 0; i < this.state.playerDeleteMessages.length; i++){

            m = this.state.playerDeleteMessages[i];

            messages.push(<div key={i}>{m}</div>);
        }

        let messagesElems = null;

        if(messages.length > 0){

            messagesElems = <div className="team-green m-top-25 p-top-25 p-bottom-25">
                {messages}
            </div>
        }

        return <div>
            <table className="t-width-2 td-1-left">
                <tbody>
                    <tr>
                        <th>Player</th>
                        <th>Action</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
            {messagesElems}
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Admin</div>

                <div className="form">

                    <div className="default-header">Player Options</div>
                    {this.displayPlayerOptions()}

                    <div className="default-header">Delete Match</div>
                    {this.displayMatchDeletedMessage()}
                    <div className={`${styles.button} team-red`} onClick={this.deleteMatch}>Delete Match</div>
                </div>
               
        </div>
    }
}

export default AdminMatchControl;