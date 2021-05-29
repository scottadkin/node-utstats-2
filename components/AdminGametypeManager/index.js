import React from 'react';


class AdminGametypeManager extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 2, 
            "data": JSON.parse(this.props.data), 
            "bFailedRename": null, 
            "renameErrors": [],
            "bFailedMerge": null,
            "mergeErrors": [],
            "mergeInProgress": false
        };

        this.renameGametype = this.renameGametype.bind(this);
        this.mergeGametype = this.mergeGametype.bind(this);
        this.changeMode = this.changeMode.bind(this);
    }

    changeMode(id){

        this.setState({"mode": id});
    }

    bNameAlreadyInUse(name){

        name = name.toUpperCase();

        let d = 0;

        for(let i = 0; i < this.state.data.length; i++){

            d = this.state.data[i];

            if(d.name.toUpperCase() === name) return true;
        }

        return false;
    }

    async renameGametype(e){

        try{

            e.preventDefault();

            console.log(e.target);

            console.log(e.target[0].value);
            console.log(e.target[1].value);

            this.setState({"bFailedRename": null, "renameErrors": []});

            const errors = [];

            let gametypeId = parseInt(e.target[0].value);

            if(gametypeId !== gametypeId){
                errors.push("GametypeID must be a valid integer.");
            }else{
                if(gametypeId < 1) errors.push(`You have not selected a gametype to rename.`);
            }

            let newName = e.target[1].value;

            if(newName.length === 0){
                errors.push(`The gametype's new name must be at least one character long.`);
            }else{

                if(this.bNameAlreadyInUse(newName)) errors.push(`The name ${newName} is already is use, we suggest you merge gametypes instead if you want to combine data.`);
        
            }

            if(errors.length === 0){

                const req = await fetch("/api/gametypeadmin", {
                    "headers": {"Content-Type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"id": gametypeId, "newName": newName, "mode": "rename"})
                });


                const result = await req.json();

                if(result.message === "passed"){

                    this.updateGametypeList(gametypeId, newName);
                    this.setState({"bFailedRename": false, "renameErrors": []});
                }

            }


            if(errors.length > 0){
                this.setState({"bFailedRename": true, "renameErrors": errors});
                console.log(`There was a problem`);
            }
            

        }catch(err){
            console.trace(err);
        }
    }


    async mergeGametype(e){

        try{

            e.preventDefault();

            let oldGametype = parseInt(e.target[0].value);
            let newGametype = parseInt(e.target[1].value);

            const errors = [];


            if(oldGametype !== oldGametype) errors.push(`oldGametype must be a valid integer.`);
            if(newGametype !== newGametype) errors.push(`newGametype must be a valid integer.`);

            if(oldGametype === -1) errors.push(`You have not selected a gametype to be merged into another.`);
            if(newGametype === -1) errors.push(`You have not selected a target gametype.`);

            if(oldGametype === newGametype) errors.push(`You can't merge a gametype into itself.`);

            console.log(`merge ${oldGametype} into ${newGametype}`);

            this.setState({"bFailedMerge": null, "mergeErrors": [], "mergeInProgress": true});

            if(errors.length === 0){

                const req = await fetch("/api/gametypeadmin", {
                    "headers": {"Content-Type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"mode": "merge", "oldGametypeId": oldGametype, "newGametypeId": newGametype})
                });

                const result = await req.json();

                console.log(result);

                if(result.message !== "passed"){

                    errors.push(result.message);
                }

            }

            if(errors.length > 0){

                this.setState({"bFailedMerge": true, "mergeErrors": errors});

            }else{
                this.setState({"bFailedMerge": false, "mergeErrors": []});
            }

            this.setState({"mergeInProgress": false});
        }catch(err){
            console.trace(err);
        }
    }

    updateGametypeList(id, newName){

        const newData = [];

        let d = 0;

        for(let i = 0; i < this.state.data.length; i++){

            d = this.state.data[i];

            if(d.id !== id){
                newData.push(d);
            }else{

                newData.push({
                    "id": d.id,
                    "name": newName,
                    "first": d.first,
                    "last": d.last,
                    "matches": d.matches,
                    "matches": d.playtime
                })
            }
        }
        this.setState({"data": newData});
    }


    createDropDown(name){

        const options = [];

        let d = 0;

        for(let i = 0; i < this.state.data.length; i++){

            d = this.state.data[i];

            options.push(<option key={i} value={d.id}>{d.name}</option>);
        }

        return <select name={name} className="default-select">
            <option value="-1">Select a gametype</option>
            {options}
        </select>
    }

    renderRenameErrors(){

        if(this.state.mode !== 0) return null;

        if(this.state.renameErrors.length === 0) return null;

        const errors = [];

        let e = 0;

        for(let i = 0; i < this.state.renameErrors.length; i++){

            e = this.state.renameErrors[i];

            errors.push(<div key={i}>{e}</div>)
        }

        return <div className="team-red p-bottom-25 m-bottom-25">
            <div className="default-header">Error</div>
            {errors}
        </div>
    }

    renderRenamePass(){

        if(this.state.mode !== 0) return null;

        if(this.state.bFailedRename !== false) return null;

        return <div className="team-green p-bottom-25 m-bottom-25">
            <div className="default-header">Passed</div>
                Rename was successful.
        </div>

    }

    renderRename(){

        if(this.state.mode !== 0) return null;

        console.log(this.state.data);

        return <div>
            <div className="default-header">Rename Gametypes</div>

            <form className="form" action="/" method="POST" onSubmit={this.renameGametype}>

                <div className="form-info">
                    Change the name of a gametype, you can't rename to a name that already exists, you can however merge the two gametypes instead.
                </div>

                {this.renderRenameErrors()}
                {this.renderRenamePass()}

                <div className="select-row">
                    <div className="select-label">Gametype to rename</div>
                    <div>{this.createDropDown("oldname")}</div>
                </div>
                <div className="select-row">
                    <div className="select-label">Gametype's new name</div>
                    <div>
                        <input type="text" name="newname" className="default-textbox" placeholder="new name...."/>
                    </div>
                </div>
                <input type="submit" className="search-button" name="submit" value="Rename"/>
            </form>
        </div>
    }


    renderMergeErrors(){

        if(this.state.mode !== 1) return null;


        if(this.state.bFailedMerge !== true) return null;

        const errorElems = [];

        let e = 0;

        for(let i = 0; i < this.state.mergeErrors.length; i++){

            e = this.state.mergeErrors[i];

            errorElems.push(<div key={i}>{e}</div>);
        }

        return <div className="team-red p-bottom-25 m-bottom-25">
            <div className="default-header">Error</div>
            {errorElems}
        </div>
    }

    renderMergePass(){

        if(this.state.mode !== 1) return null;

        if(this.state.mergeInProgress){

            return <div className="team-yellow p-bottom-25 m-bottom-25">
            <div className="default-header">Loading</div>
                Merge in progress, please wait...
        </div>
        }

        if(this.state.bFailedMerge !== false) return null;

        return <div className="team-green p-bottom-25 m-bottom-25">
            <div className="default-header">Passed</div>
                Merge was successful.
        </div>

    }

    renderMerge(){

        if(this.state.mode !== 1) return null;
    
        return <div>
            <div className="default-header">Merge Gamtypes</div>
            <form className="form" method="POST" action="/" onSubmit={this.mergeGametype}>
                <div className="form-info">
                    Merge gametypes into one single gametype taking the second selected option's name.
                </div>
                {this.renderMergeErrors()}
                {this.renderMergePass()}
                <div className="select-row">
                    <div className="select-label">
                        Merge
                    </div>
                    <div>
                        {this.createDropDown("first")}
                    </div>
                </div>

                <div className="select-row">
                    <div className="select-label">
                        Into
                    </div>
                    <div>
                        {this.createDropDown("second")}
                    </div>
                </div>

                <input type="submit" className="search-button" name="subit" value="Merge"/>
            </form>
        </div>
    
    }


    renderDelete(){
        
        if(this.state.mode !== 2) return null;

        return <div>
            <div className="default-header">Delete Gametypes</div>
            <form className="form" action="/" method="POST" onSubmit={this.delete}>
                <div className="form-info">
                    Deleting a gametype removes all data associated to it.
                </div>
            </form>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Manage Gametypes</div>

            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>
                    Rename Gametypes
                </div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);
                })}>
                    Merge Gametypes
                </div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(2);
                })}>
                    Delete Gametypes
                </div>
            </div>

            {this.renderRename()}
            {this.renderMerge()}
            {this.renderDelete()}
        </div>
    }
}


export default AdminGametypeManager;