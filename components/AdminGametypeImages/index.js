import CustomTable from "../CustomTable";
import styles from "./AdminGametypeImages.module.css";
import Link from "next/link";

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

    }catch(err){
        console.trace(err.toString());
    }
}

const bImageExists = (images, name) =>{

    name = name.toLowerCase();
    name = name.replaceAll(" ", "");

    return images.indexOf(`${name}.jpg`) !== -1;
}

const AdminGametypesImages = ({dispatch, nDispatch, images, gametypes}) =>{

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
    };

    const data = gametypes.map((g) =>{

        const imageExists = bImageExists(images, g.name);
        return {
            "name": {
                "value": g.name.toLowerCase(), 
                "displayValue": g.name,
                "className": "text-left"
            },
            "status": {
                "value": "",
                "displayValue": <td key={`${g.id}_image`} className={(imageExists) ? "team-green" : "team-red"}>
                    {(imageExists) ? "Found" : "Missing"}
                </td>,
                "bNoTD": true
                
            },
            "upload": {
                "value": "",
                "displayValue": <td key={g.id}>
                    <form action="/" method="POST" encType="multipart/form-data" onSubmit={(e) => uploadSingle(e, dispatch, nDispatch)}>
                        <input type="hidden" value={g.name}/>
                        <input type="file" accept=".jpg,.jpeg" />
                        <input type="submit" value="Upload" />
                    </form>
                </td>,
                "bNoTD": true
            }
            
        }
    });

    return <>
        <div className="default-header">Gametype Images</div>
        <div className="form">
            <div className="form-info">For best results make sure images have an aspect ratio of 16:9, file type must be <b>.jpg</b>.<br/>
            File names are automatically set to the gametype name in all lowercase with no spaces.</div>
        </div>
        <CustomTable width={1} headers={headers} data={data}/>
        <div className="default-header">Current Images</div>
        {currentImages}
    </>;
}


export default AdminGametypesImages;