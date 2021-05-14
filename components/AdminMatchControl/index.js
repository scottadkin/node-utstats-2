import React from 'react';
import styles from './AdminMatchControl.module.css';
import CountryFlag from '../CountryFlag/';


class AdminMatchControl extends React.Component{

    constructor(props){

        super(props);

        this.deleteMatch = this.deleteMatch.bind(this);
        this.deletePlayer = this.deletePlayer.bind(this);

        this.state = {"matchDeleteMessage": ""};
    }

    async deleteMatch(){

        try{

            const req = await fetch("/api/matchadmin", {
                "headers": {"Content-Type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"type": "deleteMatch", "matchId": this.props.matchId})
            });

            const result = await req.json();

            console.log(result);

            
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
                "body": JSON.stringify({"type": "deletePlayer", "matchId": this.props.matchId,"playerId": playerId})
            });

            const result = await req.json();

            console.log(result);

        }catch(err){
            console.trace(err);
        }
    }


    displayPlayerOptions(){

        const players = JSON.parse(this.props.players);

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
                <td><CountryFlag country={p.country}/>{p.name}</td>
                <td>
                    {createButton(p.id)}
                </td>
            </tr>);
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