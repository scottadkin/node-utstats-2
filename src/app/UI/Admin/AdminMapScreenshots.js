"use client"
import { useReducer, useEffect } from "react";
import MessageBox from "../MessageBox";
import Tabs from "../Tabs";
import {BasicTable} from "../Tables";
import Link from "next/link";
import Loading from "../Loading";

function reducer(state, action){

	switch(action.type){

		case "load-current-files" : {
			return {
				...state,
				"images": action.images,
				"names": action.names
			}
		}
		case "set-message": {
			return {
				...state,
				"messageBox": {
					"type": action.messageType,
					"title": action.title,
					"content": action.content,
					"timestamp": performance.now()
				}
			}
		}
		case "set-mode": {
			return {
				...state,
				"mode": action.value
			}
		}

		case "add-pending-single": {

			const data = [...state.pendingSingles];

			if(data.indexOf(action.value) === -1){
				data.push(action.value);
			}else{
				throw new Error(`Upload in progress`);
			}

			return {
				...state,
				"pendingSingles": data
			}
		}

		case "remove-pending-single": {

			const data = [...state.pendingSingles];

			const index = data.indexOf(action.value);

			if(index !== -1) data.splice(index, 1);

			return {
				...state,
				"pendingSingles": data
			}
		}

		case "set-bulk-progress": {
			return {
				...state,
				"bBulkInProgress": action.value
			}
		}
	}

	return state;
}

async function bulkUpload(mode, data, dispatch){

    try{

		dispatch({"type": "set-bulk-progress", "value": true});
        const formData = new FormData();

        formData.set("mode", mode);

        for(let i = 0; i < data.files.length; i++){

            const d = data.files[i];
            formData.append("file", d);
        }

        const response = await fetch("/api/adminUpload", {
            method: "POST",
            //"headers": {"Content-type": "multipart/form-data"},
            body: formData,
        });

        const result = await response.json();

		if(result.error !== undefined) throw new Error(result.error);

		let content = [];


		for(let i = 0; i < result.fileResults.passed.length; i++){

			const r = result.fileResults.passed[i];
			content.push(<div className="team-green padding-1" key={`p-${i}`}>Successfully uploaded <b>{r}</b></div>);
		}

		for(let i = 0; i < result.fileResults.failed.length; i++){

			const r = result.fileResults.failed[i];
			content.push(<div className="team-red  padding-1" key={`e-${i}`}>Failed to upload <b>{r}</b></div>);
		}

		dispatch({"type": "set-message", "messageType": "note", "title": "Uploads Completed", "content": content});

		await loadData(dispatch);
		dispatch({"type": "set-bulk-progress", "value": false});



    }catch(err){
        console.trace(err);
    }
}


async function singleUpload(fileName, files, dispatch){

	try{

		const formData = new FormData();

		formData.set("mode", "map-single-upload");

		if(files.length === 0) return;

		formData.set("image", files[0]);
		formData.set("mapName", fileName);

		const res = await fetch("/api/adminUpload", {
            method: "POST",
            body: formData,
        });

		if(res.error !== undefined){
			throw new Error(res.error);
		}


		await loadData(dispatch);

		dispatch({"type": "remove-pending-single", "value": fileName});
		dispatch({"type": "set-message", "messageType": "pass", "title": "Upload Successful", "content": `Uploaded /images/maps/${fileName}.jpg successful`});


	}catch(err){
		console.trace(err);
		dispatch({"type": "set-message", "messageType": "error", "title": `Failed to upload ${fileName}.jpg`, "content": `${err.toString()}`});
	}
}

function renderBulkUpload(mode, bBulkInProgress, dispatch){

	if(mode !== "bulk") return null;

	if(bBulkInProgress) return <Loading>Uploading Images Please Wait...</Loading>

    return <>
		<div className="form m-bottom-25">
			<div className="form-header">Naming Convention</div>	
			<div className="form-info">
				<ul>
					<li>You only need to do this if you're using the bulk uploader or if you manually place map screenshots in /public/images/maps.<br/>
					If you use a single Image uploader next to a map screenshot status the website will automatically name the file to match the target map.</li>
					<li>Image file names should match the file name of a map and not the map title.</li>
					<li>Filenames should all be in lowercase.</li>
					<li>Do not use [ ] ' ` characters</li>
					<li>Do not included gametype prefix in the file name</li>
					<li>Do not included .unr extension in the file name</li>
					<li>CTF-Face.unr will require an image called face.jpg</li>
					<li>There is also partial matches, if you have a the map CTF-FaceLE100 it will also be use the image face.jpg unless you have uploaded an image facele100.jpg</li>
				</ul>
			</div>
		</div>
		<form className="form" onSubmit={(e) =>{
			
			e.preventDefault();
			bulkUpload(e.target.mode.value, e.target.filesToUpload, dispatch);
		}}>
			<div className="form-header">Bulk Image Uploader</div>
			<div className="form-info m-bottom-10">
				Upload multiple map images at once, you have to name the images manually.
			</div>
			<input type="file" multiple accept="image/png, image/jpeg, image/jpg, image/bmp" name="filesToUpload" id="files"/>
			<input type="hidden" name="mode" value="map-bulk-upload"/>
			<input type="submit" value="Upload Images"/>
		</form>
	</>
}


function renderSingleUpload(mode, images, pendingSingles, dispatch){

	if(mode !== "single") return null;

	const headers = [
		"Map Name",
		"Required Image Name",
		"File Status",
		"Upload"
	];

	const rows = [];

	for(let i = 0; i < images.length; i++){

		const img = images[i];

		let className = "team-red";
		let status = "Missing";

		if(img.match !== null){

			if(img.bFullMatch){
				className = "team-green";
				status = "Full Match";
			}else{
				className = "team-yellow";
				status = `Partial Match (${img.match}.jpg)`;
			}
		}

		let elem = <td key={`wait-${i}`}>Uploading...</td>

		if(pendingSingles.indexOf(img.imageName) === -1){
			elem = <td key={`up-${i}`}><input type="file" name={img.imageName} accept="image/png, image/jpeg, image/jpg, image/bmp" onChange={(e) =>{
				dispatch({"type": "add-pending-single", "value": e.target.name});
				singleUpload(e.target.name, e.target.files, dispatch);
			}}/></td>
		}

		let currentImg = img.imageName;

		if(img.match !== null){

			currentImg = img.match;
		}

		rows.push([
			{"className": "text-left", "value": img.name},
			{"className": "text-left", "value": `${img.imageName}.jpg`},
			{"bSkipTd": true, "value": <td key={i} className={className}>
				<Link href={`/images/maps/${(img.match === null) ? "default" : currentImg}.jpg`} target="_blank">{status}</Link>
				
			</td>},
			{
				"bSkipTd": true,
				"value" :
				elem
			}
		]);
	}

	return <>
		<BasicTable headers={headers} rows={rows}/>
	</>
}

async function loadData(dispatch){

	try{

		const req = await fetch("/api/admin", {
			"headers": {"Content-type": "application/json"},
			"method": "POST",
			"body": JSON.stringify({"mode": "get-all-uploaded-map-images"})
		});

		const res = await req.json();

		if(res.error !== undefined){
			throw new Error(res.error);
		}

		dispatch({"type": "load-current-files", "images": res.images, "names": res.names});

	}catch(err){
		console.trace(err);
		dispatch({"type": "set-message", "messageType": "error", "title": "Failed To Load Map Images" ,"content": err.toString()});
	}
}

export default function AdminMapScreenshots(){

	const [state, dispatch] = useReducer(reducer, {
		"messageBox": {
			"type": null,
			"title": null,
			"content": null,
			"timestamp": 0
		},
		"images": [],
		"names": [],
		"mode": "single",
		"pendingSingles": [],
		"bBulkInProgress": false
	});

	useEffect(() =>{
		loadData(dispatch);
	}, []);

	const tabs = [
		{"name": "Single Upload", "value": "single"},
		{"name": "Bulk Upload", "value": "bulk"}
	];
 
    return <>
        <div className="default-header">Map Screenshots Manager</div>
		<Tabs options={tabs} selectedValue={state.mode} changeSelected={(v) =>{
			dispatch({"type": "set-mode", "value": v});
		}} />
		<MessageBox timestamp={state.messageBox.timestamp} type={state.messageBox.type} title={state.messageBox.title}>{state.messageBox.content}</MessageBox>
		<div className="form">
			<div className="form-header">Supported Upload Image Formats</div>	
			<div className="form-info">
				<ul>
					<li><b>.jpeg</b> image/jpeg</li>
					<li><b>.jpg</b> image/jpeg</li>
					<li><b>.png</b> image/png <span className="yellow">Gets converted to jpg</span></li>
					<li><b>.bmp</b> image/bmp <span className="yellow">Gets converted to jpg</span></li>
				</ul>
			</div>	
			<div className="form-header">For Best Appearance</div>	
			<div className="form-info">
				<ul>
					<li>Use a 16:9 aspect ratio</li>
					<li>Try To Target 1920x1080 at minimum.<br/>It doesn't matter if you use 4k or higher as 
					the website dynamically creates smaller images for better performance.</li>
				</ul>
			</div>
		</div>
        {renderSingleUpload(state.mode, state.images, state.pendingSingles, dispatch)}
        {renderBulkUpload(state.mode, state.bBulkInProgress, dispatch)}
    </>
}