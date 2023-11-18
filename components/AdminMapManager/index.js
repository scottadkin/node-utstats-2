import React from "react";
import { cleanMapName, getSimilarImage, removeUnr } from "../../api/generic.mjs";
import Tabs from "../Tabs";
import Loading from "../Loading";
import { useReducer, useEffect, useRef } from "react";
import { notificationsInitial, notificationsReducer } from "../../reducers/notificationsReducer";
import NotificationsCluster from "../NotificationsCluster";
import InteractiveTable from "../InteractiveTable";
import AdminMapMerger from "../AdminMapMerger";
import AdminMapRename from "../AdminMapRename";
import AdminMapCreate from "../AdminMapCreate";
import AdminMapDelete from "../AdminMapDelete";

const reducer = (state, action) =>{

    switch(action.type){


        case "set-list": {

            return {
                ...state,
                "fullSize": action.fullSize,
                "thumbs": action.thumbs,
                "missingThumbs": action.missingThumbs
            }
        }
        case "add-to-list": {


            const index = state.missingThumbs.indexOf(action.name);
     
            if(index !== -1){
                state.missingThumbs.splice(index, 1);
            }

            return {
                ...state,
                "fullSize": [...state.fullSize, action.name],
                "thumbs": [...state.thumbs, action.name],
                "missingThumbs": [...state.missingThumbs]
            }
        }
        case "toggle-thumbs":{
            return {
                ...state,
                "bMakingThumbs": !state.bMakingThumbs
                
            }
        }
        case "update-missing": {

            const current = [...state.missingThumbs];
            const thumbs = [...state.thumbs];

            const index = state.missingThumbs.indexOf(action.thumb);
            thumbs.push(action.thumb);

            if(index === -1){
                current.push(action.thumb); 
                
            }else{
                current.splice(index, 1);
            }

            return {
                ...state,
                "missingThumbs": [...current],
                "thumbs": [...thumbs]
                
            }
        }
        case "set-names": {
            return {
                ...state,
                "mapNames": action.names,
                "mapData": action.data
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

        case "rename-single": {
 
            const mapNames = [];
            const mapData = [];

            for(let i = 0; i < state.mapData.length; i++){

                const n = state.mapData[i];

                if(n.id === action.id){
                    n.name = action.newName;
                }

                mapNames.push(n.name);
                mapData.push(n);
          
            }

            return {
                ...state,
                "mapNames": [...mapNames],
                "mapData": [...mapData]
            }
        }

        case "add-map": {

            return {
                ...state,
                "mapNames": [...state.mapNames, action.name],
                "mapData": [...state.mapData, {"id": action.id, "name": action.name}]
            }
        }

        case "remove-map": {

            const remainingNames = [];
            const remainingData = [];

            for(let i = 0; i < state.mapData.length; i++){

                const m = state.mapData[i];

                if(m.id !== action.id){
                    remainingData.push(m);
                    remainingNames.push(m.name);
                }
            }

            return {
                ...state,
                "mapNames": remainingNames,
                "mapData": remainingData
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
            "body": JSON.stringify({"mode": "alldetails"})
        });

        const res = await req.json();

        console.log(res);

        if(res.error !== undefined){

            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            return;
        }

        dispatch({"type": "set-names", "names": res.names, "data": res.data});

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

        if(res.error === undefined){

            const missing = [];

            for(let i = 0; i < res.data.fullsize.length; i++){

                const f = res.data.fullsize[i];

                if(!/^.+?\.jpg$/i.test(f)) continue;

                if(res.data.thumbs.indexOf(f) === -1){
                    missing.push(f);
                }
            }

            console.log(`missing thumbs`, missing);

            dispatch({
                "type": "set-list", 
                "fullSize": res.data.fullsize, 
                "thumbs": res.data.thumbs,
                "missingThumbs": missing
            });
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

    if(state.mode !== 0) return null;

    const headers = {
        "name": "Name",
        "file": "Required File",
        "thumb": "Thumbnail",
        "fullsize": "Fullsize",
        "action": "Action"
    };

    const data = state.mapNames.map((m) =>{

        const name = removeUnr(m);

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
                "displayValue": `${cleanMapName(name.toLowerCase())}.jpg`
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


const createMissingThumbnail = async (fileName, nDispatch) =>{

    try{

        const req = await fetch("/api/thumbnailcreator", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "createmissingthumbnail", "file": fileName})
        });

        const res = await req.json();

        if(res.error === undefined){

            nDispatch({
                "type": "add", 
                "notification": 
                {"type": "pass", "content": `Created thumbnail ${fileName}`}
            });
            return true;

        }else{

            throw new Error(res.error);
        }

    }catch(err){

        console.trace(err);
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
        return false;
    }
}

const createMissingThumbnails = async (e, state, dispatch, nDispatch) =>{

    try{

        e.preventDefault();
        dispatch({"type": "toggle-thumbs"});

        const missing = [...state.missingThumbs];

        let passed = 0;
        let failed = 0;

        for(let i = 0; i < missing.length; i++){

            const t = missing[i];

            if(await createMissingThumbnail(t, nDispatch)){

                dispatch({
                    "type": "update-missing",
                    "thumb": t
                });

                passed++;

            }else{
                failed++;
            }
        }

        console.log("passed",passed,"failed",failed);
        dispatch({"type": "toggle-thumbs"});
    
    }catch(err){
        console.trace(err);
    }
}

const renderCreateMissing = (state, dispatch, nDispatch) =>{

    if(state.mode !== 1) return null;
    return <>
        <div className="default-sub-header">Create Missing Thumbnails</div>
        <div className="form">
            <div className="form-info m-bottom-25">
                Create all missing thumbnails where there is a fullsize image.<br/><br/>
                Found <b>{state.missingThumbs.length}</b> missing thumbnails.<br/>
                <span className="red">{state.missingThumbs.join(", ")}</span>
            </div>
            <Loading value={!state.bMakingThumbs}/>
            <form action="/" method="POST" onSubmit={(e) => createMissingThumbnails(e, state, dispatch, nDispatch)}>
                <input type="submit" className="search-button" value="Create Missing Thumbnails"/>
            </form>
        </div>
    </>
}




const AdminMapManager = () =>{


    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "mode": 5,
        "mapNames": [],
        "fullSize": [],
        "thumbs": [],
        "pending": {},
        "uploaded": [],
        "missingThumbs": [],
        "bMakingThumbs": false,
        "mapData": []
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
        {"name": "Thumbnail Creator", "value": 1},
        {"name": "Merge Maps", "value": 2},
        {"name": "Rename Map", "value": 3},
        {"name": "Create Map", "value": 4},
        {"name": "Delete Map", "value": 5},
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
        {renderCreateMissing(state, dispatch, nDispatch)}
        <AdminMapMerger mode={state.mode} maps={state.mapData} nDispatch={nDispatch} pDispatch={dispatch}/>
        <AdminMapRename mode={state.mode} maps={state.mapData} nDispatch={nDispatch} pDispatch={dispatch}/>
        <AdminMapCreate mode={state.mode} maps={state.mapData} nDispatch={nDispatch} pDispatch={dispatch}/>
        <AdminMapDelete mode={state.mode} maps={state.mapData} nDispatch={nDispatch} pDispatch={dispatch}/>
        
    </>
}

export default AdminMapManager;