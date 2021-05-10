import React from 'react';

class MapImageUploader extends React.Component{

    constructor(props){

        super(props);

        this.uploadImage = this.uploadImage.bind(this);

        this.state = {"uploaded": false, "message": "", "uploading": false, "failed": false};
    }

    async uploadImage(e){

        try{

            e.preventDefault();

            console.log(e.target);

            console.log(e.target[0]);
            console.log(e.target[1]);

            const formData = new FormData();

            console.log(e.target[0].files[0]);

            const file = new File([e.target[0].files[0]], e.target[1].value, {
                "type": e.target[0].files[0].type
            });

            if(file.size === 9) return;

            formData.append("file",file);
        
            this.setState({"uploading": "true", "message": "Uploading..."});

            const req = await fetch("/api/usermapimageupload",{
                "method": "POST",
                "body": formData
            });


            const result = await req.json();

            if(result.message === "passed"){

                this.setState({"message": "Uploaded successfully", "uploaded": true, "uploading": false, "failed": false});
            }else{

                this.setState({"message": result.message, "failed": true});
            }


        }catch(err){
            console.trace(err);
        }
    }


    renderMessage(){

        if(this.state.message.length === 0) return null;


        let className = "team-green";

        if(this.state.failed) className = "team-red";

        return <div className={className}>
            <div className="default-header">Information</div>
            <div className="m-bottom-25 p-bottom-25">
                {this.state.message}
            </div>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Upload Map Image</div>

            <div className="form">
                <div className="form-info">
                    File format must be a <b>.jpg</b>.<br/>
                    For best results the image should be in a 16:9 aspect ratio and at least 1920x1080, the site automatically creates smaller sizes for icons.
                </div>
                {this.renderMessage()}
                <form action="/" onSubmit={this.uploadImage} method="POST" encType="multipart/form-data">
                    <input type="file" name="image" accept=".jpg" />
                    <input type="hidden" name="name" value={this.props.name} />
                    <input type="submit" className="search-button m-top-25" name="submit" value="Upload" />
                </form>
            </div>

        </div>
    }
}

export default MapImageUploader;