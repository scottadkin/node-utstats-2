import React from "react";
import { cleanMapName, getSimilarImage } from "../../api/generic.mjs";
import Tabs from "../Tabs";
import Loading from "../Loading";
import { useReducer, useEffect, useRef } from "react";
import { notificationsInitial, notificationsReducer } from "../../reducers/notificationsReducer";
import NotificationsCluster from "../NotificationsCluster";
import InteractiveTable from "../InteractiveTable";

const reducer = (state, action) =>{

    switch(action.type){


        case "set-list": {
            return {
                ...state,
                "fullSize": action.fullSize,
                "thumbs": action.thumbs
            }
        }
        case "add-to-list": {
            return {
                ...state,
                "fullSize": [...state.fullSize, action.name],
                "thumbs": [...state.thumbs, action.name],
            }
        }
        case "set-names": {
            return {
                ...state,
                "mapNames": action.names
            }
        }

        case "change-mode": {
            return {
                ...state,
                "mode": action.mode
            }
        }

        case "set-pending": {

            const target = action.target;
            state.pending[target] = true;
            
            return {
                ...state,
                "pending": {...state.pending},
            }
        }

        case "unset-pending": {

            const target = action.target;

            if(state.pending[target] === undefined) return {...state};

            state.pending[target] = false;

            return {
                ...state,
                "pending": {...state.pending}
            }
        }
    }

    return state;
}


const loadMapNames = async (dispatch, nDispatch) =>{

    try{

        const req = await fetch("/api/mapmanager",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "allnames"})
        });

        const res = await req.json();

        if(res.error !== undefined){

            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            return;
        }

        dispatch({"type": "set-names", "names": res.data});

    }catch(err){

        console.trace(err);
    }
}

const loadFileList = async (dispatch, nDispatch) =>{

    try{

        const req = await fetch("/api/mapmanager", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "allimages"})
        });

        const res = await req.json();

        console.log(res);

        if(res.error === undefined){

            dispatch({"type": "set-list", "fullSize": res.data.fullsize, "thumbs": res.data.thumbs});
        }else{

            throw new Error(res.error);
        }

    }catch(err){
        console.trace(err);

        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
    }
}

const uploadSingle = async (name, formData, dispatch, nDispatch) =>{

    try{


        dispatch({"type": "set-pending", "target": name});

        const req = await fetch("/api/mapimageupload", {
            "method": "POST",
            "body": formData
        });

        const res = await req.json();

        if(res.errors !== undefined){

            for(let i = 0; i < res.errors.length; i++){

                const e = res.errors[i];

                nDispatch({"type": "add", "notification": {
                    "type": "error", "content": `Failed to upload ${name}: ${e.toString()}`
                }});
            }

            return;
        }

        nDispatch({"type": "add", "notification": {"type": "pass", "content": `Uploaded ${name} successfully.`}});

        dispatch({"type": "unset-pending", "target": name});
        console.log(name);
        dispatch({"type": "add-to-list", "name": `${name}.jpg`});
    }catch(err){
        console.trace(err);
    }
}

const bulkUpload = async (e, dispatch, nDispatch, bulkRef) =>{

    e.preventDefault();


    const files = bulkRef.current.files;

    if(files.length === 0) return;

    const pending = [];

    for(let i = 0; i < files.length; i++){

        const f = files[i];

        const test = new FormData();
        test.append(f.name, f);


        uploadSingle(f.name, test, dispatch, nDispatch);
 
    }

    await Promise.all(pending);
}

const renderBulkUploader = (state, dispatch, nDispatch, bulkRef) =>{

    if(state.mode !== 0) return null;

    return <div className="m-bottom-25">
        <div className="default-sub-header">Bulk Image Uploader</div>
        <div className="form">
            <div className="form-info m-bottom-25">
                File names must be set before hand for bulk uploading.<br/>Valid map names are in all lowercase,
                without the gametype prefix, and without .unr.<br/>
                File types are converted to .jpg, you can upload .jpg, .png, and .bmp files.<br/>
                If there is not a complete match the site fill get an image with a similar name if one exists.<br/>
                For example <b>ctf-face-le100</b> will match <b>face.jpg</b> if <b>face-le100.jpg</b> does not exist gametype prefixes are not required.
                
            </div>
            <form action="/" method="POST" encType="multipart/form-data" onSubmit={(e) => { bulkUpload(e, dispatch, nDispatch, bulkRef)} }>
                <input type="file" ref={bulkRef} className="m-bottom-25" multiple accept=".jpg,.png,.bmp"/>
                <input type="submit" className="search-button" value="Upload Images"/>
            </form>
        </div>
    </div>
    
}

const renderList = (state, dispatch, nDispatch) =>{


    const headers = {
        "name": "Name",
        "file": "Required File",
        "thumb": "Thumbnail",
        "fullsize": "Fullsize",
        "action": "Action"
    };

    const data = state.mapNames.map((m) =>{

        const name = cleanMapName(m.name);

        const bThumbs = state.thumbs.indexOf(`${name.toLowerCase()}.jpg`) !== -1;
        const bFullsize = state.fullSize.indexOf(`${name.toLowerCase()}.jpg`) !== -1;

        const bParialThumbs = getSimilarImage(state.thumbs, name);
        const bParialFullsize = getSimilarImage(state.fullSize, name);

        let formElem = <>
            <form action="/" method="POST" encType="multipart/form-data" onSubmit={async (e) =>{

                e.preventDefault();

                const formData = new FormData();

                formData.append(name.toLowerCase(), e.target[0].files[0]);

                await uploadSingle(name.toLowerCase(), formData, dispatch, nDispatch);
    
            }}>
                <input type="file" name={name.toLowerCase()} accept=".jpg,.png,.bmp"/>
                <input type="submit" value="Upload" name={name.toLowerCase()}/>
            </form>
        </>;

        if(state.pending[name.toLowerCase()] !== undefined){

            if(state.pending[name.toLowerCase()]) formElem = "Uploading...";
        }

        return {
            "name": {
                "value": name.toLowerCase(), 
                "displayValue": name,
                "className": "text-left"
            },
            "file": {
                "value": name.toLowerCase(),
                "displayValue": `${name.toLowerCase()}.jpg`
            },
            "thumb": {
                "value": bThumbs, 
                "displayValue": (bThumbs) ? "Found" : (bParialThumbs) ? `Partial Match (${bParialThumbs})` : "Missing",
                "className": (bThumbs) ? "team-green" : (bParialThumbs) ? "team-yellow" : "team-red",
            },
            "fullsize": {
                "value": bFullsize, 
                "displayValue": (bFullsize) ? "Found" : (bParialFullsize) ? `Partial Match (${bParialFullsize})` : "Missing",
                "className": (bFullsize) ? "team-green" : (bParialFullsize) ? "team-yellow" : "team-red",
            },
            "action": {"value": "", "displayValue": formElem},
        }
    });


    return <InteractiveTable width={1} headers={headers} data={data}/>
}

const AdminMapManager = () =>{


    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "mode": 0,
        "mapNames": [],
        "fullSize": [],
        "thumbs": [],
        "pending": {},
        "uploaded": []
    });

    const [nState, nDispatch] = useReducer(notificationsReducer, notificationsInitial);

    const bulkRef = useRef(null);

    useEffect(() =>{

        const controller = new AbortController();


        loadMapNames(dispatch, nDispatch);
        loadFileList(dispatch, nDispatch);

        return () =>{
            controller.abort();
        }
        
    },[]);

    const tabs = [
        {"name": "Image Uploader", "value": 0},
        //{"name": "Thumbnail Creator", "value": 1},
    ];

    return <>
        <div className="default-header">Map Manager</div>
        <Tabs options={tabs} selectedValue={state.mode} changeSelected={(mode) => dispatch({"type": "change-mode", "mode": mode})} />
        <NotificationsCluster 
            width={1}
            notifications={nState.notifications} 
            hide={(id) => {
                    nDispatch({"type": "delete", "id": id})
                }
            }
            clearAll={() => nDispatch({"type": "clearAll"})}
        />
        {renderBulkUploader(state, dispatch, nDispatch, bulkRef)}
        {renderList(state, dispatch, nDispatch)}
        
    </>
}

/*
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

                const previousThumbs = Object.assign({}, this.state.thumbs);

                previousThumbs.push(file);

                this.setState({"thumbs": previousThumbs});
                
                return true;

            }else{

                throw new Error(res.error);
            }


        }catch(err){
            console.trace(err);
            return false;
        }
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
}*/

export default AdminMapManager;