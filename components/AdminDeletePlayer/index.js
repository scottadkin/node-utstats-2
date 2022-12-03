import React from 'react';
import Loading from '../Loading';
import Notification from '../Notification';

class AdminDeletePlayer extends React.Component{

    constructor(props){

        super(props);
        this.state = {
            "names": [], 
            "bLoadingInProgress": false, 
            "bFailed": false, 
            "message": "", 
            "bDeleteInProgress": false
        };

        this.deletePlayer = this.deletePlayer.bind(this);
    }

    async loadPlayerList(){

        try{

            this.setState({
                "bLoadingInProgress": true, 
                "bFailed": false
            });

            const req = await fetch("/api/adminplayers", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "allnames"})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({
                    "names": res.names, 
                    "bLoadingInProgress": false
                });

            }else{

                this.setState({
                    "bFailed": true, 
                    "bLoadingInProgress": false
                });
            }

        }catch(err){
            console.trace(err);
        }
    }


    async deletePlayer(e){

        try{

            e.preventDefault();

            let playerId = parseInt(e.target[0].value);

            this.setState({      
                "message": "Deleting player please wait...",
                "bDeleteInProgress": true,
            });

            if(playerId !== playerId){

                this.setState({      
                    "message": "PlayerID must be a valid integer",
                    "bDeleteInProgress": false,
                    "bFailed": true
                });

                return;
            }

            if(playerId === -1){

                this.setState({      
                    "message": "You have not selected a player to delete.",
                    "bDeleteInProgress": false,
                    "bFailed": true
                });

                return;
            }

            const req = await fetch("/api/adminplayers", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "delete", "playerId": playerId})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({      
                    "message": res.message,
                    "bDeleteInProgress": false,
                    "bFailed": false
                });

                await this.loadPlayerList();

            }else{

                this.setState({      
                    "message": res.error,
                    "bDeleteInProgress": false,
                    "bFailed": true
                });

            }

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        await this.loadPlayerList();
    }

    renderDropDown(){

        if(this.state.bLoadingInProgress) return null;

        const options = [];

        for(let i = 0; i < this.state.names.length; i++){

            const n = this.state.names[i];
            options.push(<option key={i} value={n.id}>{n.name}</option>);
        }

        return <select className="default-select">
            <option value="-1">Select a Player</option>
            {options}
        </select>
    }

    render(){

        let elems = <Loading />;

        if(!this.state.bLoadingInProgress){

            elems = <div className="form">
                <div className="form-info m-bottom-25">Delete everything related to a player.</div>
                <form action="/" method="POST" onSubmit={this.deletePlayer}>
                    <div className="select-row">
                        <div className="select-label">
                            Player
                        </div>
                        <div>
                            {this.renderDropDown()}
                        </div>
                    </div>
                    <input type="submit" className="search-button" value="Delete Player"/>
                </form>
            </div>;
        }

        let notification = null;

        if(this.state.bDeleteInProgress){

            notification = <Notification type={"warning"}>
                {this.state.message}
            </Notification>    

        }else if(this.state.bFailed){

            notification = <Notification  type={"error"}>
                {this.state.message}
            </Notification> 

        }else{

            notification = <Notification  type={"pass"}>
                {this.state.message}
            </Notification> 
        }

        return <div>
            <div className="default-header">Delete Player</div>
            {elems}
            {notification}
        </div>
    }
}

export default AdminDeletePlayer;