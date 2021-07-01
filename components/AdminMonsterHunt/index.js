import React from 'react';
import TrueFalse from '../TrueFalse';


class AdminMonsterHunt extends React.Component{

    constructor(props){

        super(props);

        this.bulkUpload = this.bulkUpload.bind(this);
        this.singleUpload = this.singleUpload.bind(this);

        this.state = {
            "singleErrors": [],
            "singlePassed": null,
            "singleUploadInProgress": false,
            "bulkErrors": [],
            "bulkPassed": null,
            "bulkUploadInProgress": false
        };

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
            <table className="t-width-1 m-bottom-25">
                <tbody>
                    <tr>
                        <th>Class Name</th>
                        <th>Display Name</th>
                        <th>Matches Seen</th>
                        <th>Total Deaths</th>
                        <th>Image Status</th>
                        <th>Upload</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
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

    render(){

        return <div>
            <div className="default-header">MonsterHunt Monster Image Uploader</div>

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
        </div>
    }
}


export default AdminMonsterHunt;