import React from 'react';


class AdminGametypeManager extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 3, 
            "data": this.props.data, 
            "bFailedRename": null, 
            "renameErrors": [],
            "bFailedMerge": null,
            "mergeErrors": [],
            "mergeInProgress": false,
            "bFailedDelete": null,
            "deleteErrors": [],
            "deleteInProgress": false,
            "singleUploadPassed": null,
            "singleUploadInProgress": false,
            "singleErrors": [],
            "multiUploadInProgress": false,
            "multiUploadPassed": null,
            "multiErrors": []
        };

        this.renameGametype = this.renameGametype.bind(this);
        this.mergeGametype = this.mergeGametype.bind(this);
        this.changeMode = this.changeMode.bind(this);
        this.delete = this.delete.bind(this);

        this.uploadSingle = this.uploadSingle.bind(this);
        this.uploadMultiple = this.uploadMultiple.bind(this);

        console.log(this.props.images);
    }

    async uploadMultiple(e){

        try{

            e.preventDefault();

            const errors = [];

            this.setState({
                "multiUploadInProgress": true,
                "multiUploadPassed": null,
                "multiErrors": []
            });

            if(e.target[0].files.length === 0){

                errors.push("You have not selected an image to upload");
            };

            if(errors.length === 0){

                const formData = new FormData();


                const fileNames = [];


                for(let i = 0; i < e.target[0].files.length; i++){

                    formData.append(`file_${i}`, e.target[0].files[i]);

                    fileNames.push(e.target[0].files[i].name);
                }


                const req = await fetch("/api/gametypeimageuploader", {
                    "method": "POST",
                    "body": formData
                });

                const result = await req.json();

                console.log(result);

                if(result.message !== "passed"){
                    errors.push(result.message);
                }else{

                    const images = Object.assign(this.props.images);

                    for(let i = 0; i < fileNames.length; i++){

                        images.push(fileNames[i]);
                    }

                    this.props.updateImages(images);
                }
            }


            if(errors.length === 0){

                this.setState({
                    "multiUploadInProgress": false,
                    "multiUploadPassed": true,
                    "multiErrors": []
                });

            }else{

                this.setState({
                    "multiUploadInProgress": false,
                    "multiUploadPassed": false,
                    "multiErrors": errors
                });
            }

        }catch(err){
            console.trace(err);
        }
    }

    async uploadSingle(e){

        try{

            e.preventDefault();

            const errors = [];

            if(e.target[1].files.length === 0){
                errors.push("You have not selected a file to upload.");
            }


            this.setState({
                "singleUploadInProgress": true,
                "singleErrors":[],
                "singleUploadPassed": null
            });
        

            if(errors.length === 0){

                const formData = new FormData();

                formData.append("mode", "single");
                formData.append("fileName", e.target[0].value);
                formData.append("file", e.target[1].files[0]);
                

                const req = await fetch("/api/gametypeimageuploader",{
                    "method": "POST",
                    "body": formData
                });

                const result = await req.json();


                if(result.message !== "passed"){
                    errors.push(result.message);
                }else{

                    const images = Object.assign(this.props.images);
                    images.push(e.target[0].value);
                    this.props.updateImages(images);
                }
            }

            if(errors.length > 0){

                this.setState({
                    "singleUploadInProgress": false,
                    "singleErrors":errors,
                    "singleUploadPassed": false
                });

            }else{

                this.setState({
                    "singleUploadInProgress": false,
                    "singleErrors":[],
                    "singleUploadPassed": true
                });
            }

        }catch(err){
            console.trace(err);
        }

    }

    async delete(e){

        try{

            e.preventDefault();

            console.log(e.target[0].value);

            let gametypeId = parseInt(e.target[0].value);

            gametypeId = parseInt(gametypeId);

            const errors = [];

            this.setState({"bFailedDelete": null, "deleteInProgress": true});

            if(gametypeId !== gametypeId){
                errors.push("Gametype must be a valid integer.");
            }

            if(gametypeId < 1){
                errors.push("You have not selected a gametype to delete.");
            }


            if(errors.length === 0){

                const req = await fetch("/api/gametypeadmin", {
                    "headers": {"Content-Type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"mode": "delete", "gametypeDelete": gametypeId})
                });

                const res = await req.json();

                console.log(res);

                if(res.message === "passed"){

                    this.setState({"bFailedDelete": false, "deleteInProgress": false});

                    this.removeGametype(gametypeId);

                    this.props.updateParentGametypeNames(this.state.data);

                }else{
                    errors.push(res.message);
                }
            }

            if(errors.length > 0){

                this.setState({"bFailedDelete": true, "deleteInProgress": false, "deleteErrors": errors});
            }

        }catch(err){
            console.trace(err);
        }
    }


    removeGametype(id){

        const newGametypes = [];


        let d = 0;

        for(let i = 0; i < this.state.data.length; i++){

            d = this.state.data[i];

            if(d.id !== id){
                newGametypes.push(d);
            }
        }

        this.setState({"data": newGametypes});
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
                    this.props.updateParentGametypeNames(this.state.data);
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

                <input type="submit" className="search-button" name="submit" value="Merge"/>
            </form>
        </div>
    
    }


    renderDeleteErrors(){

        if(this.state.mode !== 2) return null;

        if(this.state.bFailedDelete === false) return null;

        const errorElems = [];

        if(this.state.deleteInProgress){

            return <div className="team-yellow p-bottom-25 m-bottom-25">
                <div className="default-header">Processing</div>
                Delete in progress please wait...
            </div>
        }

        if(this.state.deleteErrors.length === 0) return null;

        let e = 0;

        for(let i = 0; i < this.state.deleteErrors.length; i++){

            e = this.state.deleteErrors[i];

            errorElems.push(<div key={i}>{e}</div>);
        }


        return <div className="team-red p-bottom-25 m-bottom-25">
            <div className="default-header">Error</div>
            {errorElems}
        </div>
    }

    renderDeletePassed(){

        if(this.state.mode !== 2) return null;


        console.log(`failedDelete = ${this.state.bFailedDelete}`);
        if(this.state.bFailedDelete !== false) return null;
        if(this.state.deleteInProgress) return null;

        return <div className="team-green p-bottom-25 m-bottom-25">
            <div className="default-header">Passed</div>
            Gametype delete was successful.
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
                {this.renderDeleteErrors()}
                {this.renderDeletePassed()}
                <div className="select-row">
                    <div className="select-label">
                        Gametype to delete
                    </div>
                    <div>
                        {this.createDropDown("delete")}
                    </div>
                </div>
                <input type="submit" className="search-button"  name="submit" value="Delete"/>
            </form>
        </div>
    }


    cleanName(input){

        input = input.toLowerCase();

        return input.replace(/ /ig,"");
    }


    renderSingleProgress(){

        if(this.state.mode !== 3) return null;

        if(this.state.singleUploadInProgress){

            return <div className="center team-yellow t-width-1 m-bottom-25 p-bottom-25">
                <div className="default-header">Uploading Image</div>
                Upload in progress please wait...
            </div>
        }

        if(this.state.singleUploadPassed === true){

            return <div className="center team-green t-width-1 m-bottom-25 p-bottom-25">
                <div className="default-header">Upload Successful</div>
                Image was uploaded successfully
            </div>

        }else if(this.state.singleUploadPassed === false){

            const errors = [];

            for(let i = 0; i < this.state.singleErrors.length; i++){

                errors.push(<div key={i}>{this.state.singleErrors.length}</div>);
            }

            return <div className="center team-red t-width-1 m-bottom-25 p-bottom-25">
                <div className="default-header">Error</div>
                There was a problem uploading the image.
                {errors}
            </div>

        }
    }

    renderMultiProgress(){

        if(this.state.mode !== 3) return null;

        if(this.state.multiUploadInProgress){

            return <div className="center team-yellow t-width-1 m-bottom-25 p-bottom-25">
                <div className="default-header">Uploading Image</div>
                Upload in progress please wait...
            </div>
        }

        if(this.state.multiUploadPassed === true){

            return <div className="center team-green t-width-1 m-bottom-25 p-bottom-25">
                <div className="default-header">Upload Successful</div>
                Images were uploaded successfully
            </div>

        }else if(this.state.multiUploadPassed === false){

            const errors = [];

            for(let i = 0; i < this.state.multiErrors.length; i++){

                errors.push(<div key={i}>{this.state.multiErrors.length}</div>);
            }

            return <div className="center team-red t-width-1 m-bottom-25 p-bottom-25">
                <div className="default-header">Error</div>
                There was a problem uploading the image files.
                {errors}
            </div>

        }
    }


    getImageStatus(name){

        let current = 0;

        console.log(`LOOKING FOR ${name}`);

        for(let i = 0; i < this.props.images.length; i++){

            current = this.props.images[i];

            console.log(current);

            if(current.replace('.jpg','') === name){
                return <td className="team-green">Found</td>
            }
        }

        return <td className="team-red">Missing</td>
    }

    renderImageUploader(){

        if(this.state.mode !== 3) return null;

        const rows = [];

        let d = 0;

        for(let i = 0; i < this.props.data.length; i++){

            d = this.props.data[i];

            rows.push(<tr key={i}>
                <td>{d.name}</td>
                {this.getImageStatus(this.cleanName(d.name))}
                <td>
                    <form action="/" method="POST" encType="multipart/form-data" onSubmit={this.uploadSingle}>
                        <input type="hidden" value={this.cleanName(d.name)}/>
                        <input type="file" accept=".jpg,.jpeg" />
                        <input type="submit" value="Upload" />
                    </form>
                </td>
            </tr>);
        }

        return <div>
            <div className="default-header">Gametype Image Uploader</div>

            <div className="default-header">Bulk Image Uploader</div>
            {this.renderMultiProgress()}
            <form className="form" method="POST" action="/" encType="multipart/form-data" onSubmit={this.uploadMultiple}>
                <div className="form-info">
                    Images must be .jpg, and ideally 16:9 aspect ratio.<br/>
                    Name them in all lowercase with no spaces, e.g Capture the Flag should be called <b>capturetheflag.jpg</b>
                </div>
                <div className="select-row">
                    <div className="select-label">
                        Files
                    </div>
                    <div>
                        <input type="file" multiple accept=".jpg,.jpeg"/>
                    </div>
                </div>
                <input type="submit" className="search-button" value="Upload Images"/>
            </form>

            <div className="default-header">Single Image uploader</div>
            <form className="form m-bottom-25">
                <div className="form-info">For single image uploads the name is automatically set, required file type is the same as specified above.</div>
            </form>
            {this.renderSingleProgress()}
            {(rows.length === 0) ? null :
                <table className="t-width-1">
                    <tbody>
                        <tr>
                            <th>Gametype Name</th>
                            <th>File Status</th>
                            <th>Upload</th>
                        </tr>
                        {rows}
                    </tbody>
                </table>
                }
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
                <div className={`tab ${(this.state.mode === 3) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(3);
                })}>
                    Upload Gametype Images
                </div>
            </div>

            {this.renderRename()}
            {this.renderMerge()}
            {this.renderDelete()}
            {this.renderImageUploader()}
        </div>
    }
}


export default AdminGametypeManager;