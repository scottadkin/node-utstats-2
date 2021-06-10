import React from 'react';


class AdminWeaponImageUploader extends React.Component{

    constructor(props){

        super(props);

        this.uploadFiles = this.uploadFiles.bind(this);
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

    render(){

        return <div>
            <div className="default-header">Weapon Image Uploader</div>

            <form action="/" method="POST" onSubmit={this.uploadFiles} encType="multipart/form-data">
                <input type="file" name="potato" id="potato" multiple accept={`.png`}/>
                <input type="submit" className="search-button" value="Upload Files"/>
            </form>
        </div>
    }
}

export default AdminWeaponImageUploader;