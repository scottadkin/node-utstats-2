import React from 'react';
import Table2 from '../Table2';

class AdminWeaponImageUploader extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "singleUploadInProgress": false,
            "singleFailed": null,
            "singleErrors": [],
            "multiUploadInProgress": false,
            "multiFailed": null,
            "multiErrors": []
        };

        this.uploadFiles = this.uploadFiles.bind(this);
        this.uploadSingle = this.uploadSingle.bind(this);

    }

    async uploadSingle(e){

        try{

            e.preventDefault();

            const errors = []

            this.setState({"singleFailed": null, "singleErrors": [], "singleUploadInProgress": true});

            if(e.target[0].files.length > 0){

                const name = e.target[0].name;
                const file = e.target[0].files[0]

                const formData = new FormData();

                formData.append("single", "true");
                formData.append("name", name);
                formData.append("file", file);

                const req = await fetch("/api/adminweaponimageuploader", {
                    "method": "POST",
                    "body": formData
                });

                const result = await req.json();


                if(result.message !== "passed"){
                    errors.push(result.message);
                }else{
                    this.setState({"singleFailed": false, "singleErrors": [], "singleUploadInProgress": false});
                    this.props.updateParent(`${name}.png`);
                    return;
                }

            

            }else{
                errors.push("You have not selected a file to upload...");
            }

            this.setState({"singleFailed": true, "singleErrors": errors, "singleUploadInProgress": false});

        }catch(err){
            console.trace(err);
        }
    }

    async uploadFiles(e){

        try{

            e.preventDefault();

            const errors = [];

            const names = [];

            this.setState({"multiFailed": null, "multiErrors": [], "multiUploadInProgress": true});

            if(e.target[0].files.length > 0){


                const formData = new FormData();

                for(let i = 0; i < e.target[0].files.length; i++){

                    names.push(e.target[0].files[i].name);
                    formData.append("files",e.target[0].files[i]);
                }

                console.log(names);

                formData.append("single", false);
                
                //console.log(formData);

                const req = await fetch("/api/adminweaponimageuploader", {
                    "method": "POST",
                    "body": formData
                });

                const result = await req.json();

                if(result.message === "passed"){

                    this.setState({"multiFailed": false, "multiErrors": [], "multiUploadInProgress": false});

                    for(let i = 0; i < names.length; i++){
                        this.props.updateParent(names[i]);
                    }
                    return;

                }else{

                    errors.push(result.message);
                }

            }else{

                errors.push("You have not selected any files to upload.");
            }


            this.setState({"multiFailed": true, "multiErrors": errors, "multiUploadInProgress": false});
            

        }catch(err){
            console.trace(err);
        }
    }

    fixFileName(name){

        name = name.toLowerCase();
        return name.replace(/ /ig, "");
        
    }

    fileExists(name){

        name = this.fixFileName(name);
        name = `${name}.png`;

        let f = 0;

        for(let i = 0; i < this.props.data.files.length; i++){

            f = this.props.data.files[i];

            if(f === name) return true;
          
        }

        return false;
   
    }

    renderSingleUploads(){

        const rows = [];


        let w = 0;
        let currentStatus = 0;
        let statusString = 0;
        let statusClassName = 0;

        for(let i = 0; i < this.props.data.names.length; i++){

            w = this.props.data.names[i];

            currentStatus = this.fileExists(w.name);

            if(currentStatus){
                statusString = "Found";
                statusClassName = "team-green";
            }else{
                statusString = "Missing";
                statusClassName = "team-red";
            }

            rows.push(<tr key={i}>
                <td>{w.name}</td>
                <td className={statusClassName}>{statusString}</td>
                <td>
                    <form action="/" method="POST" encType="multipart/form-data" onSubmit={this.uploadSingle}>
                        <input type="file" accept=".png" name={this.fixFileName(w.name)} />
                        <input type="submit" value="Upload"/>
                    </form>
                </td>
            </tr>);
        }

        return <div>
            <div className="default-header">Single Uploads</div>
            <Table2 width={1}>
                <tr>
                    <th>Weapon Name</th>
                    <th>Status</th>
                    <th>Upload</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }


    renderSingleNotification(){

        const errors = [];

        if(this.state.singleFailed === true){

            for(let i = 0; i < this.state.singleErrors.length; i++){

                errors.push(this.state.singleErrors[i]);
            }

            return <div className="team-red p-bottom-25 m-top-25 t-width-1 center">
                <div className="default-header">Single Upload Failed</div>
                {errors}
            </div>;

        }else if(this.state.singleFailed === false){

            return <div className="team-green p-bottom-25 m-top-25 t-width-1 center">
                <div className="default-header">Single Upload Passed</div>
                Image upload was successful
            </div>;

        }

        if(this.state.singleUploadInProgress){
            return <div className="team-yellow p-bottom-25 m-top-25 t-width-1 center">
                <div className="default-header">Single Upload In Progress</div>
                Uploading please wait....
            </div>;
        }
    }

    renderMultiNotification(){

        const errors = [];

        if(this.state.multiFailed === true){

            for(let i = 0; i < this.state.multiErrors.length; i++){

                errors.push(this.state.multiErrors[i]);
            }

            return <div className="team-red p-bottom-25 m-top-25 t-width-1 center">
                <div className="default-header">Multi File Upload Failed</div>
                {errors}
            </div>;

        }else if(this.state.multiFailed === false){

            return <div className="team-green p-bottom-25 m-top-25 t-width-1 center">
                <div className="default-header">Multi File Upload Passed</div>
                Image uploads were successful.
            </div>;

        }

        if(this.state.multiUploadInProgress){
            return <div className="team-yellow p-bottom-25 m-top-25 t-width-1 center">
                <div className="default-header">Multi Upload In Progress</div>
                Uploading please wait....
            </div>;
        }
    }

    render(){

        return <div>
            <div className="default-header">Weapon Image Uploader</div>

            <div className="default-header">Bulk Image Uploader</div>
            {this.renderMultiNotification()}
            <form action="/" className="form" method="POST" onSubmit={this.uploadFiles} encType="multipart/form-data">
                <div className="form-info">
                    Upload multiple images at once, file type must be png, names are not set for bulk uploading, they are however cleaned to work with the naming scheme(all lower case, no spaces).
                </div>
                <input type="file" className="m-bottom-25" name="potato" id="potato" multiple accept={`.png`}/>
                <input type="submit" className="search-button" value="Upload Files"/>
            </form>

            {this.renderSingleNotification()}
            {this.renderSingleUploads()}
        </div>
    }
}

export default AdminWeaponImageUploader;