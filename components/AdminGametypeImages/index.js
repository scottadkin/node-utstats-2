import CustomTable from "../CustomTable";
import styles from "./AdminGametypeImages.module.css";
import Link from "next/link";
import { getSimilarImage } from "../../api/generic.mjs";
import { useState } from "react";
import Loading from "../Loading";

const uploadSingle = async (e, dispatch, nDispatch) =>{

    try{

        e.preventDefault();

        if(e.target[1].files.length === 0){
            //errors.push("You have not selected a file to upload.");
            //return;
        }

        const formData = new FormData();

        //formData.append("mode", "single");
        formData.append("fileName", e.target[0].value);
        formData.append("file", e.target[1].files[0]);
        

        const req = await fetch("/api/gametypeimageuploader",{
            "method": "POST",
            "body": formData
        });

        const res = await req.json();

        if(res.error !== undefined){
            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            return;
        }

        dispatch({"type": "addImage", "newImage": `${e.target[0].value}.jpg`});
        nDispatch({"type": "add", "notification": {"type": "pass", "content": res.message}});   
        e.target.reset();
        

    }catch(err){
        console.trace(err.toString());
    }
}

const deleteImage = async (dispatch, nDispatch, image) =>{

    try{

        image = image.toLowerCase().replaceAll(" ", "");

        image = `${image}.jpg`;

        const req = await fetch("/api/gametypeadmin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "delete-image", "image": image})
        });

        const res = await req.json();

        if(res.error !== undefined){
            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            return;
        }

        nDispatch({"type": "add", "notification": {"type": "pass", "content": `Deleted ${image} successfully.`}});
        dispatch({"type": "removeImage", "targetImage": image});
        console.log(res);
    }catch(err){
        console.trace(err);
    }
}

const bImageExists = (images, name) =>{

    name = name.toLowerCase();
    name = name.replaceAll(" ", "");

    return images.indexOf(`${name}.jpg`) !== -1;
}

const AdminGametypesImages = ({dispatch, nDispatch, images, gametypes}) =>{

    const [bLoading, setBLoading] = useState(false);

    const IMAGE_DIR = "/images/gametypes/";

    const currentImages = images.map((i) =>{

        const url = `${IMAGE_DIR}${i}`;

        return <div className={styles.wrapper} key={i}>
            <Link href={url} target="_blank">
                <img className={`${styles.image} hover`} src={url} alt="image"/>
            </Link>
            <div className={styles.name}>
                {i}
            </div>
        </div>
    });

    const headers = {
        "name": {"display": "Name"},
        "status": {"display": "Image Status"},
        "upload": {"display": "Upload"},
        "delete": {"display": "Delete"}
    };

    const data = gametypes.map((g) =>{

        const imageExists = bImageExists(images, g.name);

        let partialMatch = null;

        if(!imageExists){
            partialMatch = getSimilarImage(images, g.name);
        }

        let statusElem = null;

        if(partialMatch === null){
            statusElem = <td key={`${g.id}_image`} className={(imageExists) ? "team-green" : "team-red"}>
                {(imageExists) ? "Found" : "Missing"}
            </td>;
        }else{
            statusElem = <td key={`${g.id}_image`} className="team-yellow">
                Partial Match<br/>
                ({partialMatch})
            </td>
        }


        let deleteElem = <td key={`${g.id}_delete`}>N/A</td>;

        if(imageExists){
            deleteElem = <td key={`${g.id}_delete`} className="team-red hover" onClick={async () =>{
                setBLoading(true);
                await deleteImage(dispatch, nDispatch, g.name);
                setBLoading(false);
            }}>Delete Image</td>;
        }

        return {
            "name": {
                "value": g.name.toLowerCase(), 
                "displayValue": g.name,
                "className": "text-left"
            },
            "status": {
                "value": "",
                "displayValue": statusElem,
                "bNoTD": true
                
            },
            "upload": {
                "value": "",
                "displayValue": <td key={g.id}>
                    <form action="/" method="POST" encType="multipart/form-data" onSubmit={async (e) =>{
                        setBLoading(true);
                        await uploadSingle(e, dispatch, nDispatch)
                        setBLoading(false);
                    }
                    }>
                        <input type="hidden" value={g.name}/>
                        <input type="file" accept=".jpg,.jpeg" />
                        <input type="submit" value="Upload" />
                    </form>
                </td>,
                "bNoTD": true
            },
            "delete": {
                "value": "",
                "displayValue": deleteElem,
                "bNoTD": true
            }
            
        }
    });

    return <>
        <div className="default-header">Gametype Images</div>
        <div className="form">
            <div className="form-info">
                For best results make sure images have an aspect ratio of 16:9, file type must be <b>.jpg</b>.<br/>
                File names are automatically set to the gametype name in all lowercase with no spaces.<br/>
                If there is not an exact match a similar image name is used instead, for example <b>New Capture The Flag</b> will use <b>capturetheflag.jpg</b>.
            </div>
        </div>
        <Loading value={!bLoading}/>
        <CustomTable width={1} headers={headers} data={data}/>
        <div className="default-header">Current Images</div>
        {currentImages}
    </>;
}


export default AdminGametypesImages;