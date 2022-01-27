import React from "react";
import Functions from '../../api/functions';
import Loading from '../Loading';
import Notification from '../Notification';


class AdminPlayerRename extends React.Component{

    constructor(props){

        super(props);
        this.state = {"error": null, "bInProgress": false, "bPassed": false, "notification": null,"displayUntil": 0};
        this.changeName = this.changeName.bind(this);
    }

    getDisplayUntil(seconds){

        return Math.ceil(Date.now() * 0.001) + seconds;
    }

    async changeName(e){

        this.setState({
            "bInProgress": true, 
            "error": null, 
            "bPassed": false, 
            "notification": 
            "Rename in Progress.", 
            "displayUntil": this.getDisplayUntil(5)
        });

        e.preventDefault();

        const currentId = parseInt(e.target[0].value);

        if(currentId === -1){
            this.setState({"error": "You have not selected a player to rename.","displayUntil": this.getDisplayUntil(5)});
            return;
        }

        const newName = e.target[1].value;

        if(newName === ""){
            this.setState({"error": "The new name can not be blank.","displayUntil": this.getDisplayUntil(5)});
            return;
        }
        
        const currentPlayer = Functions.getPlayer(this.props.players, currentId);
        const bNameInUse = this.bNameInUse(newName);

        if(bNameInUse){

            this.setState({"error": "Name is already in use!","displayUntil": this.getDisplayUntil(5)});
            return;

        }else{

            const req = await fetch("/api/adminplayers", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "rename", "oldName": currentPlayer.name, "newName": newName,"displayUntil": this.getDisplayUntil(5)})
            });

            const res = await req.json();

            if(res.error === undefined){
                this.setState({"bInProgress": false, "bPassed": true, "notification": res.message,"displayUntil": this.getDisplayUntil(5)});

                setTimeout(async () =>{
                    await this.props.reloadPlayers();
                }, 1500);
                
                return;
            }else{
                this.setState({"bInProgress": false, "bPassed": false, "notification": res.error,"displayUntil": this.getDisplayUntil(5)});
            }
        }

        
   
    }

    renderNameDropDown(){

        const options = [];

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];
            options.push(<option key={i} value={p.id}>{p.name}</option>);

        }

        return <select className="default-select">
            <option value="-1">Select a player</option>
            {options}
        </select>
    }

    bNameInUse(name){

        if(this.props.names.indexOf(name.toLowerCase()) === -1){
            return false;
        }

        return true;
    }

    renderNotifcation(){

        if(this.state.bPassed){
            return <Notification displayUntil={this.state.displayUntil} type="pass">{this.state.notification}</Notification>
        }

        if(this.state.error !== null || this.state.bInProgress){

            return <Notification displayUntil={this.state.displayUntil} type="error">{this.state.error}</Notification>
        }

        return null;
    }

    render(){

        return <div>
            <div className="default-header">Rename Player</div>
            

            <div className="form">
                <div className="form-info m-bottom-25">Change a player&apos;s name to another one.<br/>You can&apos;t rename a player to a name that already exists
                you must merge the players instead.</div>

                <form action="/" method="POST" onSubmit={this.changeName}>
                    <div className="select-row">
                        <div className="select-label">Current Name</div>
                        <div>
                            {this.renderNameDropDown()}
                        </div>
                    </div>

                    <div className="select-row">
                        <div className="select-label">New Name</div>
                        <div>
                            <input type="text" className="default-textbox" placeholder="new name"/>
                        </div>
                    </div>

                    <input type="submit" className="search-button" value="Change Name"/>
                </form>
            </div>
            {this.renderNotifcation()}
        </div>
    }
}

export default AdminPlayerRename;