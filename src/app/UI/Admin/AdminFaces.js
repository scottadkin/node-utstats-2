"use client"
import { useEffect, useReducer } from "react";
import MessageBox from "../MessageBox";
import {BasicTable} from "../Tables";
import {convertTimestamp} from "../../../../api/generic.mjs";
import Image from "next/image";

function reducer(state, action){

    switch(action.type){

        case "loaded": {
            return {
                ...state,
                "data": action.data
            }
        }
        case "set-message": {
            return {
                ...state,
                "messageBox":{
                    "type": action.messageType,
                    "title": action.title,
                    "content": action.content,
                    "timestamp": performance.now()
                }
            }
        }
        case "add-pending": {

            const pending = [...state.pending];

            if(pending.indexOf(action.value) === -1){

                pending.push(action.value);
            }

            return {
                ...state,
                "pending": pending
            }
        }

        case "remove-pending": {

            const pending = [...state.pending];

            const index = pending.indexOf(action.value);

            if(index !== -1){
                pending.splice(index, 1);
            }

            return {
                ...state,
                "pending": pending,
                "test": performance.now()
            }
        }
    }

    return state;
}

async function loadData(dispatch){

    try{

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "get-faces"})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        res.data.sort((a, b) =>{

            a = a.uses;
            b = b.uses;
            if(a > b) return -1;
            if(a < b) return 1;
            return 0;
        });

        dispatch({"type": "loaded", "data": res.data});

    }catch(err){
        
        console.trace(err);
        dispatch({"type": "set-message", "messageType": "error", "title": "Failed to load faces data", "content": err.toString()});
    }
}


async function uploadImage(name, files, dispatch){

    try{

        if(files.length === 0) return;

        if(name === "") throw new Error(`File name can not be a blank string`);

        dispatch({"type": "add-pending", "value": name});

        const formData = new FormData();

        formData.set("mode", "upload-face");
        formData.set("imageName", name);
        formData.set("image", files[0]);


        const req = await fetch("/api/adminUpload", {
            "method": "POST",
            "body": formData
        });

        const res = await req.json();


        if(res.error !== undefined) throw new Error(res.error);
        
        dispatch({"type": "set-message", "messageType": "pass", "title": "Image Upload Successful", "content": `./images/faces/${name}.png Upload completed.`});
        await loadData(dispatch);

    }catch(err){
        console.trace(err);
        dispatch({"type": "set-message", "messageType": "error", "title": "Failed to upload image", "content": err.toString()});
    }

    dispatch({"type": "remove-pending", "value": name});
}

function renderFaces(data, pending, test, dispatch){

    const headers = [
        "Image",
        "Name",
        "First Used",
        "Last Used",
        "Times Used",
        "Upload Image"
    ];

    const rows = data.map((d) =>{

        let elem = <>Uploading...</>;

        if(pending.indexOf(d.name) === -1){

            elem = <input type="file" accept="image/png" onChange={(e) =>{

                uploadImage(d.name, e.target.files, dispatch);
     
            }}/>;
        }

        return [
            {"className": "text-left", "value": <Image width={38} height={38} alt="image" src={`/images/faces/${d.image}.png#${test}`}/>},
            {"className": "text-left", "value": d.name},
            {"className": "date", "value": convertTimestamp(d.first, true)},
            {"className": "date", "value": convertTimestamp(d.last, true)},
            d.uses,
            <>
                {elem}
            </>
        ];
    });

    return <BasicTable width={1} headers={headers} rows={rows}/>
}

export default function AdminFaces({}){

    const [state, dispatch] = useReducer(reducer, {
        "data": [],
        "messageBox": {
            "type": null,
            "title": null,
            "content": null,
            "timestamp": 0
        },
        "pending": []
    });

    useEffect(() =>{

        loadData(dispatch);
    },[]);

    return <>
        <div className="default-header">Faces Manager</div>
        <MessageBox type={state.messageBox.type} title={state.messageBox.title} timestamp={state.messageBox.timestamp}>{state.messageBox.content}</MessageBox>
        <div className="form m-bottom-25">
            <div className="form-header m-bottom-10">
                Image Requirements
            </div>
            <div className="form-info">
                <ul>
                    <li><b>.png</b> image/png Format</li>
                    <li>1:1 Aspect ratio</li>
                    <li>Target 64x64 at minimum</li>
                    <li>Image names are automatically set.</li>
                </ul>
            </div>
        </div>
        {renderFaces(state.data, state.pending, state.test, dispatch)}
    </>
}