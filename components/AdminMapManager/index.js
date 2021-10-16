import React from 'react';
import Functions from '../../api/functions';
import TrueFalse from '../TrueFalse';

class AdminMapManager extends React.Component{

    constructor(props){

        super(props);
        this.state = {
            "mode": 1,
            "fullsize": [], 
            "thumbs": [], 
            "names": [], 
            "expectedFileNames": [], 
            "finishedLoading": false,
            "uploads": {},
            "thumbsCompleted": 0,
            "thumbsErrors": 0,
            "missingThumbs": [],
            "thumbsInProgress": false
        };

        this.uploadImage = this.uploadImage.bind(this);
        this.bulkUploader = this.bulkUploader.bind(this);
        this.changeMode = this.changeMode.bind(this);
        this.createMissingThumbnails = this.createMissingThumbnails.bind(this);
    }


    changeMode(id){

        this.setState({"mode": id});
    }

    async uploadSingle(fileName, formData){

        try{


            const req = await fetch("/api/mapimageupload", {
                "method": "POST",
                "body": formData
            });

            const res = await req.json();

            const currentUploads = Object.assign(this.state.uploads);


            if(res.errors === undefined){

                currentUploads[fileName] = {"finished": true, "errors": []}

                const fullsize = Object.assign(this.state.fullsize);
                const thumbsize = Object.assign(this.state.thumbs);

                fullsize.push(fileName);
                thumbsize.push(fileName);

                this.setState({"fullsize": fullsize, "thumbs": thumbsize});

            }else{
                currentUploads[fileName] = {"finished": true, "errors": res.errors}
            }
            
            this.setState({"uploads": currentUploads});
           

        }catch(err){
            console.trace(err);
        }
    }

    async bulkUploader(e){

        try{

            e.preventDefault();

            const files = e.target[0].files;

            if(files.length === 0) return;

            const currentUploads = Object.assign(this.state.uploads);

            for(let i = 0; i < files.length; i++){

                const f = files[i];
                currentUploads[f.name] = {"finished": false, "errors": []}
            }
            
            this.setState({"uploads": currentUploads});
            

            for(let i = 0; i < files.length; i++){

                const f = files[i];

                const formData = new FormData();

                formData.append(f.name, files[i]);

                this.uploadSingle(f.name, formData);

            }


        }catch(err){
            console.trace(err);
        }
    }

    async uploadImage(e){

        try{

            e.preventDefault();

            const name = e.target[0].name;
            const fullName = e.target[1].name;

            const formData = new FormData();

            if(e.target[0].files.length === 0){

                alert("No File selected");
                return;
            }

            const currentUploads = Object.assign(this.state.uploads);

            currentUploads[fullName] = {"finished": false, "errors": []}

            this.setState({"uploads": currentUploads});

            formData.append(name, e.target[0].files[0]);

            const req = await fetch("/api/mapimageupload",{
                "method": "POST",
                "body": formData
            });

            const res = await req.json();

            const newUploads = Object.assign(this.state.uploads);

            if(res.errors === undefined){
    
                newUploads[fullName] = {"finished": true, "errors": []};

                const fullsize = Object.assign(this.state.fullsize);
                const thumbsize = Object.assign(this.state.thumbs);

                fullsize.push(name);
                thumbsize.push(name);

                this.setState({"fullsize": fullsize, "thumbs": thumbsize});

            }else{
                newUploads[fullName] = {"finished": true, "errors": res.errors};
            }

            this.setState({"uploads": newUploads});

        }catch(err){
            console.trace(err);
        }

    }

    async loadFileList(){

        try{

            const req = await fetch("/api/mapmanager", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "allimages"})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({"fullsize": res.data.fullsize, "thumbs": res.data.thumbs});
            }else{

                throw new Error(res.error);
            }

        }catch(err){
            console.trace(err);
        }
    }

    async loadMapNames(){

        try{

            const req = await fetch("/api/mapmanager",{
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "allnames"})
            });

            const res = await req.json();

            if(res.error === undefined){

                const names = [];
                const expectedFileNames = [];

                for(let i = 0; i < res.data.length; i++){

                    expectedFileNames.push(Functions.cleanMapName(res.data[i].name).toLowerCase());
                    names.push(Functions.removeUnr(res.data[i].name));
    
                }


                this.setState({"names": names, "expectedFileNames": expectedFileNames});

            }else{
                throw new Error(res.error);
            }

        }catch(err){
            console.trace(err);
        }   
    }

    async loadMissingThumbnails(){

        try{

            this.setState({"thumbsInProgress": false});

            this.setState({
                "thumbsCompleted": 0,
                "thumbsErrors": 0,
                "thumbsInProgress": false
            });

            const req = await fetch("/api/thumbnailcreator", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "missingthumbnails"})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({"missingThumbs": res.data});

            }else{
                throw new Error(res.error);
            }

        }catch(err){
            console.trace(err);
        }
    }

    async createMissingThumbnails(e){

        try{

            this.setState({"thumbsInProgress": true});

            e.preventDefault();

            for(let i = 0; i < this.state.missingThumbs.length; i++){

                const t = this.state.missingThumbs[i];

                if(await this.createMissingThumbnail(t)){

                    const previousCompleted = this.state.thumbsCompleted;
                    this.setState({"thumbsCompleted": previousCompleted + 1});

                }else{

                    const previousFailed = this.state.thumbsErrors;
                    this.setState({"thumbsErrors": previousFailed + 1});
                }
            }

            setTimeout(() =>{
                this.loadMissingThumbnails();
            }, 3000);

        }catch(err){
            console.trace(err);
        }
    }

    async createMissingThumbnail(file){

        try{

            const req = await fetch("/api/thumbnailcreator", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "createmissingthumbnail", "file": file})
            });

            const res = await req.json();

            if(res.error === undefined){
                
                return true;

            }else{

                throw new Error(res.error);
            }


        }catch(err){
            console.trace(err);
            return false;
        }
    }

    async componentDidMount(){

        await this.loadFileList();
        await this.loadMapNames();
        await this.loadMissingThumbnails();
        this.setState({"finishedLoading": true});
    }


    renderFileTable(){

        if(this.state.mode !== 0) return null;

        if(!this.state.finishedLoading) return null;

        const rows = [];

        for(let i = 0; i < this.state.names.length; i++){

            const n = this.state.names[i];
            const expectedFile = `${this.state.expectedFileNames[i]}.jpg`;

            const fullsizeIndex = this.state.fullsize.indexOf(expectedFile);
            const thumbIndex = this.state.thumbs.indexOf(expectedFile);

            rows.push(<tr key={i}>
                <td>{n}</td>
                <td>{expectedFile}</td>
                <TrueFalse bTable={true} value={fullsizeIndex !== -1} fDisplay="Missing" tDisplay="Found"/>
                <TrueFalse bTable={true} value={thumbIndex !== -1} fDisplay="Missing" tDisplay="Found"/>
                <td>

                    <form action="/" method="POST" encType="multipart/form-data" onSubmit={this.uploadImage}>
                        <input type="file" name={expectedFile} accept=".jpg,.png,.bmp"/>
                        <input type="submit" value="Upload" name={n}/>
                    </form>
                </td>
            </tr>);
        }

        return <div>
            <div className="default-sub-header">Single Image Uploader</div>
            <div className="form">
                <div className="form-info">
                    Image names are automatically set for single image uploads, thumbnails are generated on upload.
                </div>
  
            </div>
            <table className="t-width-1 td-1-left">
                <tbody>
                    <tr>
                        <th>Map</th>
                        <th>Required Image</th>
                        <th>Fullsize Image</th>
                        <th>Thumb Image</th>
                        <th>Actions</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    renderBulkUploader(){

        if(this.state.mode !== 0) return null;

        return <div className="m-bottom-25">
            <div className="default-sub-header">Bulk Image Uploader</div>
            <div className="form">
                <div className="form-info m-bottom-25">
                    File names must be set before hand for bulk uploading.<br/>Valid map names are in all lowercase,
                    without the gametype prefix, and without .unr.<br/>
                    File types are converted to .jpg, you can upload .jpg, .bmp, and .bmp files.
                </div>
                <form action="/" method="POST" encType="multipart/form-data" onSubmit={this.bulkUploader}>
                    <input type="file" className="m-bottom-25" multiple accept=".jpg,.png,.bmp"/>
                    <input type="submit" className="search-button" value="Upload Images"/>
                </form>
            </div>
        </div>
    }

    renderUploadProgress(){

        if(this.state.mode !== 0) return null;

        const rows = [];

        for(const [key, value] of Object.entries(this.state.uploads)){

            let colorClass = "";
            let displayText = "";
            const errors = [];
           // const colorClass = (value.finished) ? (value.errors.length === 0) ? "team-green" : "team-red" : "team-yellow";

            if(value.finished){

                if(value.errors.length === 0){
                    colorClass = "team-green";
                    displayText = "Upload Successful";
                }else{
                    colorClass = "team-red";

                    for(let i = 0; i < value.errors.length; i++){

                        errors.push(<div key={i}><b>Error:</b> {value.errors[i]}</div>);
                    }

                    displayText = errors;
                }
            }else{

                colorClass = "team-yellow";
                displayText = "Uploading, please wait...";
            }

            rows.push(<tr key={rows.length}>
                <td>{key}</td>
                <td className={colorClass}>{displayText}</td>
            </tr>);
        }


        if(rows.length === 0) return null;

        return <div className="m-bottom-25">
            <div className="default-sub-header">Uploads In Progress</div>
            <table className={`t-width-1`}>
                <tbody>
                    <tr>
                        <th>File</th>
                        <th>Status</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    renderThumbnailProgress(){

        if(!this.state.thumbsInProgress) return null;

        return <div>
            <div className="m-bottom-25">
                In progress...<br/> {this.state.thumbsCompleted} / {this.state.missingThumbs.length} Complete<br/><br/>
                <div className="red">{this.state.thumbsErrors} Errors</div>
            </div>
        </div>
    }

    renderCreateMissing(){

        if(this.state.mode !== 1) return null;

        return <div>
            <div className="default-sub-header">Create Missing Thumbnails</div>
            <div className="form">
                <div className="form-info m-bottom-25">
                    Create all missing thumbnails where there is a fullsize image.<br/><br/>
                    Found <b>{this.state.missingThumbs.length}</b> missing thumbnails.<br/>
                    <span className="red">{this.state.missingThumbs.join(", ")}</span>
                </div>
                {this.renderThumbnailProgress()}
                <form action="/" method="POST" onSubmit={this.createMissingThumbnails}>
                    <input type="submit" className="search-button" value="Create Missing Thumbnails" onClick={this.createThumbnails}/>
                </form>
            </div>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Map Manager</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>
                    Image Uploader
                </div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`}onClick={(() =>{
                    this.changeMode(1);
                })}>
                    Thumbnail Creator
                </div>
            </div>
            {this.renderUploadProgress()}
            {this.renderBulkUploader()}
            {this.renderFileTable()}
            {this.renderCreateMissing()}
        </div>
    }
}

export default AdminMapManager;