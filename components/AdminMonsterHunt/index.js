import React from 'react';
import TrueFalse from '../TrueFalse';
import Table2 from '../Table2';


class AdminMonsterHunt extends React.Component{

    constructor(props){

        super(props);

        this.bulkUpload = this.bulkUpload.bind(this);
        this.singleUpload = this.singleUpload.bind(this);
        this.changeMode = this.changeMode.bind(this);

        this.rename = this.rename.bind(this);

        this.state = {
            "singleErrors": [],
            "singlePassed": null,
            "singleUploadInProgress": false,
            "bulkErrors": [],
            "bulkPassed": null,
            "bulkUploadInProgress": false,
            "mode": 1,
            "renamePassed": null,
            "renameInProgress": false,
            "renameErrors": []
        };

    }

    async rename(e){

        try{

            e.preventDefault();

            this.setState({
                "renamePassed": null,
                "renameInProgress": true,
                "renameErrors": []
            });


            const target = parseInt(e.target[0].value);
            const newName = e.target[1].value;

            const errors = [];

            if(target !== target) errors.push("Monster id must be a valid integer.");
            if(target < 1) errors.push("You have not selected a monster to rename.");

            if(newName === "") errors.push("A monster's name can not be an empty string.");

            if(errors.length === 0){

                const req = await fetch("/api/adminmonsterrename", {
                    "headers": {"Content-Type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"monsterId": target, "name": newName})
                });

                const result = await req.json();

                if(result.message !== "passed"){
                    errors.push(result.message);
                }else{

                    this.props.updateMonster(target, newName);
                }
            }

            if(errors.length > 0){

                this.setState({
                    "renamePassed": false,
                    "renameInProgress": false,
                    "renameErrors": errors
                });

            }else{

                this.setState({
                    "renamePassed": true,
                    "renameInProgress": false,
                    "renameErrors": []
                });
            }

        }catch(err){
            console.trace(err);
        }
    }


    changeMode(id){
        this.setState({"mode": id});
    }

    async bulkUpload(e){

        try{

            e.preventDefault();

            const errors = [];

            this.setState({
                "singleErrors": [],
                "singlePassed": null,
                "singleUploadInProgress": false,
                "bulkErrors": [],
                "bulkPassed": null,
                "bulkUploadInProgress": true
            });

            const fileNames = [];


            if(e.target[0].files.length > 0){

                const formData = new FormData();

                for(let i = 0; i < e.target[0].files.length; i++){

                    fileNames.push(e.target[0].files[i].name.toLowerCase());

                    formData.append("files", e.target[0].files[i]);
                }

                const req = await fetch("/api/adminmonsterhunt", {
                    "method": "POST",
                    "body": formData
                });

                const result = await req.json();

                if(result.message !== "passed"){
                    errors.push(result.message);
                }

            }else{
                errors.push("You have not selected any files to upload");
            }

            if(errors.length === 0){

                for(let i = 0; i < fileNames.length; i++){

                    this.props.addMonster(fileNames[i]);
                }

                this.setState({
                    "singleErrors": [],
                    "singlePassed": null,
                    "singleUploadInProgress": false,
                    "bulkErrors": [],
                    "bulkPassed": true,
                    "bulkUploadInProgress": false
                });
            }else{

                this.setState({
                    "singleErrors": [],
                    "singlePassed": null,
                    "singleUploadInProgress": false,
                    "bulkErrors": errors,
                    "bulkPassed": false,
                    "bulkUploadInProgress": false
                });
            }

        }catch(err){
            console.trace(err);
        }
    }

    async singleUpload(e){

        try{

            e.preventDefault();

            const errors = [];

            this.setState({
                "singleErrors": [],
                "singlePassed": null,
                "singleUploadInProgress": false,
                "bulkErrors": [],
                "bulkPassed": null,
                "bulkUploadInProgress": false
            });

            const name = e.target[0].value;

            if(e.target[1].files[0] === undefined){
                errors.push("You have not selected a file to upload.");
            }


            if(errors.length === 0){

                const file = e.target[1].files[0];

                const formData = new FormData();

                formData.append("fileName", name);
                formData.append("single", true);
                formData.append("file", file);

                const req = await fetch("/api/adminmonsterhunt", {
                    "method": "POST",
                    "body": formData
                });

                const result = await req.json();

                if(result.message !== "passed"){
                    errors.push(result.message);
                }else{
                    this.props.addMonster(`${name}.png`);
                }
            }


            if(errors.length === 0){

                this.setState({
                    "singleErrors": [],
                    "singlePassed": true,
                    "singleUploadInProgress": false
                });
    
            }else{

                this.setState({
                    "singleErrors": errors,
                    "singlePassed": false,
                    "singleUploadInProgress": false
                });
    
            }
          

        }catch(err){
            console.trace(err);
        }
    }


    getImageStatus(name){

        name = `${name}.png`;

        let image = 0;

        for(let i = 0; i < this.props.images.length; i++){

            image = this.props.images[i];

            if(name === image) return true;
        }

        return false;
    }

    renderTable(){

        const rows = [];

        let m = 0;

        for(let i = 0; i < this.props.monsters.length; i++){

            m = this.props.monsters[i];

            rows.push(<tr key={i}>
                <td>{m.class_name}</td>
                <td>{m.display_name}</td>
                <td>{m.matches}</td>
                <td>{m.deaths}</td>
                <TrueFalse bTable={true} value={this.getImageStatus(m.class_name)} tDisplay="Found" fDisplay="Missing"/>
                <td>
                    <form action="/" method="POST" onSubmit={this.singleUpload}>
                        <input type="hidden" value={m.class_name}/>
                        <input type="file" accept=".png" />
                        <input type="submit" value="Upload"/>
                    </form>
                </td>
            </tr>);
        }

        return <div>
            {this.renderSingleProgress()}
            <Table2 width={1}>
                <tr>
                    <th>Class Name</th>
                    <th>Display Name</th>
                    <th>Matches Seen</th>
                    <th>Total Deaths</th>
                    <th>Image Status</th>
                    <th>Upload</th>
                </tr>
                {rows}
            </Table2>
            {this.renderSingleProgress()}
        </div>
    }

    renderSingleProgress(){

        if(this.state.singleUploadInProgress){

            return <div className="t-width-1 center team-yellow m-bottom-25 p-bottom-25">
                <div className="default-header">Uploading</div>
                    Upload in progress please wait...
                </div>
        }

        if(this.state.singlePassed === true){

            return <div className="t-width-1 center team-green m-bottom-25 p-bottom-25">
            <div className="default-header">Success</div>
                Image was uploaded successfully.
            </div>

        }else if(this.state.singlePassed === false){

            const errors = [];

            for(let i = 0; i < this.state.singleErrors.length; i++){

                errors.push(<div key={i}>{this.state.singleErrors[i]}</div>);
            }

            return <div className="t-width-1 center team-red m-bottom-25 p-bottom-25">
            <div className="default-header">Error</div>
                There was a problem upload the image.
                {errors}
            </div>

        }
    }


    renderBulkProgress(){

        if(this.state.bulkUploadInProgress){

            return <div className="t-width-1 center team-yellow m-bottom-25 p-bottom-25">
            <div className="default-header">Bulk Uploading</div>
                Bulk upload in progress please wait...
            </div>
        }

        if(this.state.bulkPassed === false){

            const errors = [];

            for(let i = 0; i < this.state.bulkErrors.length; i++){

                errors.push(<div key={i}>{this.state.bulkErrors[i]}</div>);
            }

            return <div className="t-width-1 center team-red m-bottom-25 p-bottom-25">
            <div className="default-header">Error</div>
                There was a problem uploading the images.
                {errors}
            </div>

        }else if(this.state.bulkPassed === true){

            return <div className="t-width-1 center team-green m-bottom-25 p-bottom-25">
            <div className="default-header">Success</div>
                All images where uploaded successfully.
            </div>
        }
    }

    renderUpload(){

        if(this.state.mode !== 0) return null;

        return <div>
            <div className="default-header">Monster Image Uploader</div>
            <form className="form m-bottom-25" action="/" method="POST" onSubmit={this.bulkUpload}>
                <div className="form-info">
                    Image format must be .png.<br/>
                    File name must the the monster's classname in lowercase.<br/>
                    Bulk image uploads do not auto set there names.<br/>
                    Single image upload automatically sets their names.<br/>
                </div>

                <div className="default-header">Bulk Uploader</div>

                {this.renderBulkProgress()}

                <input type="file" className="m-bottom-25" multiple accept=".png"/>

                <input type="submit" className="search-button" value="Upload"/>
            </form>

            {this.renderTable()}
        </div>;
    }

    createDropDown(){

        const options = [];


        let m = 0;

        for(let i = 0; i < this.props.monsters.length; i++){

            m = this.props.monsters[i];

            options.push(<option key={i} value={m.id}>{m.display_name} ({m.class_name})</option>);
        }


        return <select className="default-select">
            <option value="-1">Select a monster...</option>
            {options}
        </select>
    }

    renderRenameProgress(){

        if(this.state.renameInProgress){

            return <div className="t-width-1 center team-yellow m-bottom-25 p-bottom-25">
                <div className="default-header">Rename In Progress</div>
                    Rename in progress, please wait...
                </div>
        }

        if(this.state.renamePassed === true){

            return <div className="t-width-1 center team-green m-bottom-25 p-bottom-25">
                <div className="default-header">Success</div>
                    Monster was rename successfully.
                </div>

        }else if(this.state.renamePassed === false){

            const errors = [];

            for(let i = 0; i < this.state.renameErrors.length; i++){

                errors.push(<div key={i}>{this.state.renameErrors[i]}</div>);
            }

            return <div className="t-width-1 center team-red m-bottom-25 p-bottom-25">
                <div className="default-header">Error</div>
                    Failed to rename monster.
                    {errors}
                </div>
        }
    }

    renderRename(){

        return <div>
            <div className="default-header">Rename Monsters</div>
            <form className="form" action="/" method="POST" onSubmit={this.rename}>
                {this.renderRenameProgress()}
                <div className="select-row">
                    <div className="select-label">Current Name</div>
                    <div>{this.createDropDown()}</div>
                </div>
                <div className="select-row">
                    <div className="select-label">New Name</div>
                    <div><input type="text" className="default-textbox" placeholder="new name..." /></div>
                </div>
                <input type="submit" className="search-button" value="Rename"/>
            </form>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">MonsterHunt Manager</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : null }`} onClick={(() =>{
                    this.changeMode(0);
                })}>Image Uploader</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : null }`} onClick={(() =>{
                    this.changeMode(1);
                })}>Rename Monsters</div>
            </div>
            {this.renderUpload()}
            {this.renderRename()}
        </div>
    }
}


export default AdminMonsterHunt;