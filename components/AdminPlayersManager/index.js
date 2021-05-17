import React from 'react';
import CountryFlag from '../CountryFlag/';

class AdminPlayersManager extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0, "playerNames": JSON.parse(this.props.playerNames), "nameErrors": []};

        this.renamePlayer = this.renamePlayer.bind(this);
        this.targetNameChange = this.targetNameChange(this);
    }

    targetNameChange(e){

        console.log(e);
    }

    async renamePlayer(e){

        try{

            e.preventDefault();

            const targetName = e.target[0].value;
            const newName = e.target[1].value;

            console.log(`targetName = ${targetName}`);
            console.log(`newName = ${newName}`);

            const errors = [];

            if(targetName === "") errors.push("You have not selected a player to rename.");
            if(newName === "")    errors.push("The new name can't be an empty string.")
            

            this.setState({"nameErrors": errors});


        }catch(err){
            console.trace(err);
        }
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
            <div className="default-header">Error</div>
            {strings}
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
                    You can't rename a player to a name that is already taken, you can however merge existing players together.
                </div>

                {this.renderNameErrors()}

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

    render(){

        return <div>
            <div className="default-header">Manage Uses</div>

            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`}>Rename Players</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`}>Merge Players</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : ""}`}>Delete Players</div>
            </div>

            {this.renderPlayerNames()}
        </div>
    }
}

export default AdminPlayersManager;