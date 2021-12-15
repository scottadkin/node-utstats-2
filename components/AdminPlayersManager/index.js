import React from 'react';

class AdminPlayersManager extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 0, 
            "playerNames": JSON.parse(this.props.playerNames), 
            "nameErrors": [], 
            "namePassed": false, 
            "newName": "", 
            "oldName": "",
            "mergeErrors": [],
            "mergedPassed": null
        };

        this.renamePlayer = this.renamePlayer.bind(this);
        this.targetNameChange = this.targetNameChange.bind(this);

        this.changeMode = this.changeMode.bind(this);

        this.mergePlayers = this.mergePlayers.bind(this);

        this.deletePlayer = this.deletePlayer.bind(this);
    }

    async mergePlayers(e){

        try{

            e.preventDefault();

            const first = e.target[0].value;
            const second = e.target[1].value;

            console.log(`Merge ${first} into ${second}`);

            const errors = [];

            if(first === "" || second === "")  errors.push("First or second name is an empry string.");
            if(first === second) errors.push("First and the second player are the same player already.");
            
            if(errors.length === 0){

                this.setState({"mergedPassed": null});

                const req = await fetch("/api/playeradmin", {
                    "headers": {"Content-Type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"type": "mergePlayers", "first": first, "second": second})
                });

                const result = await req.json();


                if(result.message === "passed"){

                    this.removePlayerFromMergeList(first);
                    this.setState({"mergedPassed": true});
                }else{
                    this.setState({"mergedPassed": false});
                }
            }else{
                this.setState({"mergedPassed": false});
            }

            this.setState({"mergeErrors": errors});
            

        }catch(err){
            console.trace(err);
        }
    }

    removePlayerFromMergeList(playerId){

        playerId = parseInt(playerId);
        const newList = [];

        let p = 0;

        console.log(`remove player ${playerId}`);

        for(let i = 0; i < this.state.playerNames.length; i++){

            p = this.state.playerNames[i];

            console.log(p);
            console.log(playerId);

            if(p.id !== playerId){
                newList.push(p);
            }

        }


        this.setState({"playerNames": newList});
    }

    changeMode(id){

        this.setState({"mode": id});
    }

    targetNameChange(e){

        console.log(e);
    }

    async renamePlayer(e){

        try{

            e.preventDefault();

            const targetName = e.target[0].value;
            const newName = e.target[1].value;

            const errors = [];

            if(targetName === "") errors.push("You have not selected a player to rename.");
            if(newName === "")    errors.push("The new name can't be an empty string.")

            if(newName === targetName) errors.push("New name is the same as old name.");

            if(this.bNameAlreadyTaken(newName)){
                errors.push("Name is already taken.");
            }

        
            this.setState({"nameErrors": errors, "namePassed": false});

            if(errors.length === 0){

                const req = await fetch("/api/playeradmin", {
                    "headers": {"Content-Type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"new": newName, "old": targetName, "type": "nameChange"})
                });

                const res = await req.json();

                if(res.message === "passed"){   

                    this.updatePlayerNames(targetName, newName);

                    this.setState({"namePassed": true, "newName": newName, "oldName": targetName});

                }else{
                    
                    this.setState({"namePassed": false, "newName": newName, "oldName": targetName});
                }
            }


        }catch(err){
            console.trace(err);
        }
    }

    updatePlayerNames(oldName, newName){

        let p = 0;

        let newNames = [];

        for(let i = 0; i < this.state.playerNames.length; i++){

            p = this.state.playerNames[i];

            if(p.name !== oldName){
                newNames.push({"id": p.id, "name": p.name, "country": p.country});
            }else{
                newNames.push({"id": p.id, "name": newName, "country": p.country});
            }

        }

        this.setState({"playerNames": newNames});
    }

    bNameAlreadyTaken(newName){

        let p = 0;

        for(let i = 0; i < this.state.playerNames.length; i++){

            p = this.state.playerNames[i];

            if(p.name === newName) return true;
        }

        return false;
    }


    renderNameErrors(){

        if(this.state.mode !== 0) return null;

        if(this.state.nameErrors.length === 0) return null;

        let strings = [];

        let e = 0;

        for(let i = 0; i < this.state.nameErrors.length; i++){

            e = this.state.nameErrors[i];


            strings.push(<div key={i}>{e}</div>);
        }

        return <div className="team-red p-bottom-25 m-bottom-25">
            <div className="default-header">Rename Failed</div>
            {strings}
        </div>
    }

    renderNamePassed(){

        if(this.state.mode !== 0) return null;

        if(!this.state.namePassed) return null;

        return <div className="team-green t-bottom-25 m-bottom-25 p-bottom-25">
            <div className="default-header">Rename Successful</div>

            The player with the name <b>{this.state.oldName}</b> is now known as <b>{this.state.newName}</b>
        </div>
    }
    
    renderPlayerNames(){

        if(this.state.mode !== 0) return null;

        const players = this.state.playerNames;

        const options = [];

        let p = 0;

        for(let i = 0; i < players.length; i++){

            p = players[i];

            options.push(
                <option key={i} value={p.name}>{p.name}</option>
            );
        }

        return <div>
            <div className="default-header">Rename Players</div>

            <form className="form" method="POST" action="/" onSubmit={this.renamePlayer}>


                <div className="form-info m-bottom-25">
                    Rename an existing player to a new name.<br/>
                    You can&apos;t rename a player to a name that is already taken, you can however merge existing players together.
                </div>

                {this.renderNameErrors()}
                {this.renderNamePassed()}

                <div>
                    <select name="target" defaultValue={""} className="default-select m-bottom-25" onChange={this.targetNameChange}>
                        <option value="">Select a Player</option>
                        {options}
                    </select>
                </div>
                
                <div>
                    <input type="text" name="new-name" className="default-textbox" placeholder="new name...."/>
                </div>
                
                <input type="submit" className="search-button m-top-25" value="Update Name"/>
            </form>
        </div>
        
    }

    createPlayerNamesDropDown(name){

        const options = [];

        let p = 0;


        for(let i = 0; i < this.state.playerNames.length; i++){

            p = this.state.playerNames[i];

            options.push(<option key={i} value={p.id}>
                {p.name}
            </option>);
        }

        return <select name={name} className="default-select">
            <option value="">Select a player</option>
            {options}
        </select>;
    }

    renderMergeErrors(){

        if(this.state.mode !== 1) return null;

        if(this.state.mergeErrors.length === 0) return null;

        const errors = [];

        let e = 0;

        for(let i = 0; i < this.state.mergeErrors.length; i++){

            e = this.state.mergeErrors[i];

            errors.push(<div key={i}>{e}</div>);
        }

        return <div className="team-red m-top-25 p-top-25 m-bottom-25 p-bottom-25">
            {errors}
        </div>
    }

    renderMergedPassed(){

        if(this.state.mode !== 1) return null;


        if(this.state.mergedPassed !== true) return null;

        
        return <div className="team-green m-top-25 p-top-25 m-bottom-25 p-bottom-25">
            Player Merge Passed!
        </div>
    }

    renderPlayerMerger(){

        if(this.state.mode !== 1) return null;

        return <div>
            <div className="default-header">Merge Players</div>
            <form className="form" method="POST" action="/" onSubmit={this.mergePlayers}>
                <div className="form-info m-bottom-25">
                    Select a player to merge with another player, the first player will be merged into the second player taking the second player&apos;s name.
                </div>
                <div className="select-row">
                    <div className="select-label">First Player</div>
                    <div>
                        {this.createPlayerNamesDropDown("first")}
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Second Player</div>
                    <div>
                        {this.createPlayerNamesDropDown("second")}
                    </div>
                </div>
                {this.renderMergedPassed()}
                {this.renderMergeErrors()}
                <input type="submit" className="search-button m-top-25" value="Merge Players"/>
            </form>
        </div>
    }

    async deletePlayer(e){

        try{

            e.preventDefault();

            let playerId = parseInt(e.target[0].value);

            console.log(`Attempting to delete player ${playerId}`);

            const req = await fetch("/api/playeradmin", {
                "headers": {"Content-Type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"type": "deletePlayer", "playerId": playerId})
            });

            const result = req.json();

            console.log(result);

        }catch(err){
            console.trace(err);
        }
    }

    renderDeletePlayer(){

        if(this.state.mode !== 2) return null;

        return <div>
            <div className="default-header">Delete Player</div>

            <form action="/" method="POST" className="form" onSubmit={this.deletePlayer}>
                <div className="form-info">Select a player to delete, this will delete everything related to the player.<br/>This action is irreversible!</div>
                <div className="select-row">
                    <div className="select-label">Player To Delete</div>
                    <div>
                        {this.createPlayerNamesDropDown("player")}
                    </div>
                </div>
                <input type="submit" className="search-button" value="Delete Player" />
            </form>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Manage Uses</div>

            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>Rename Players</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);
                })}>Merge Players</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(2);
                })}>Delete Players</div>
            </div>

            {this.renderPlayerNames()}
            {this.renderPlayerMerger()}
            {this.renderDeletePlayer()}
        </div>
    }
}

export default AdminPlayersManager;