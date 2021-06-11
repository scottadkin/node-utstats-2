import React from 'react';


class AdminWeaponImageUploader extends React.Component{

    constructor(props){

        super(props);

        this.uploadFiles = this.uploadFiles.bind(this);

        console.table(props.data.files);
    }

    async uploadFiles(e){

        try{

            e.preventDefault();

            console.log(e.target[0].files);

            const formData = new FormData();

            for(let i = 0; i < e.target[0].files.length; i++){

               formData.append("files",e.target[0].files[i]);
            }

            formData.append("single", false);
            
            //console.log(formData);

            const req = await fetch("/api/adminweaponimageuploader", {
                "method": "POST",
                "body": formData
            });

            const result = await req.json();

            console.log(result);

        }catch(err){
            console.trace(err);
        }
    }

    fileExists(name){

        name = name.toLowerCase();
        name = name.replace(/ /ig, "");
        name = `${name}.png`;

        let f = 0;

        console.log(`looking for file ${name}`);

        for(let i = 0; i < this.props.data.files.length; i++){

            f = this.props.data.files[i];

            console.log(`${name} === ${f}`);

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
                <td><input type="file" accept=".png"/></td>
            </tr>);
        }

        return <div>
            <div className="default-header">Single Uploads</div>
            <table className="t-width-2">
                <tbody>
                    <tr>
                        <th>Weapon Name</th>
                        <th>Status</th>
                        <th>Upload</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Weapon Image Uploader</div>

            <div className="default-header">Bulk Image Uploader</div>
            <form action="/" className="form" method="POST" onSubmit={this.uploadFiles} encType="multipart/form-data">
                <div className="form-info">
                    Upload multiple images at once, file type must be png, names are not set for bulk uploading, they are however cleaned to work with the naming scheme(all lower case, no spaces).
                </div>
                <input type="file" className="m-bottom-25" name="potato" id="potato" multiple accept={`.png`}/>
                <input type="submit" className="search-button" value="Upload Files"/>
            </form>

            {this.renderSingleUploads()}
        </div>
    }
}

export default AdminWeaponImageUploader;