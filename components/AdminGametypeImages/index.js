import CustomTable from "../CustomTable";
import styles from "./AdminGametypeImages.module.css";
import Link from "next/link";

const uploadSingle = async (e) =>{

    try{

        e.preventDefault();

        const errors = [];

        if(e.target[1].files.length === 0){
            //errors.push("You have not selected a file to upload.");
            //return;
        }


        /*this.setState({
            "singleUploadInProgress": true,
            "singleErrors":[],
            "singleUploadPassed": null
        });*/
    

        const formData = new FormData();

        //formData.append("mode", "single");
        formData.append("fileName", e.target[0].value);
        formData.append("file", e.target[1].files[0]);
        

        const req = await fetch("/api/gametypeimageuploader",{
            "method": "POST",
            "body": formData
        });

        const result = await req.json();

        console.log(result);
            
    

    }catch(err){
        console.trace(err.toString());
    }

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

    /*
    <td>
        <form action="/" method="POST" encType="multipart/form-data" onSubmit={this.uploadSingle}>
            <input type="hidden" value={this.cleanName(d.name)}/>
            <input type="file" accept=".jpg,.jpeg" />
            <input type="submit" value="Upload" />
        </form>
    </td>
    */

    const headers = {
        "name": {"display": "Name"},
        "status": {"display": "Image Status"},
        "upload": {"display": "Upload"}
    };
    const data = gametypes.map((g) =>{
        return {
            "name": {
                "value": g.name.toLowerCase(), 
                "displayValue": g.name,
                "className": "text-left"
            },
            "status": {
                "value": "",
                "displayValue": "",
                
            },
            "upload": {
                "value": "",
                "displayValue": <td key={g.id}>
                    <form action="/" method="POST" encType="multipart/form-data" onSubmit={uploadSingle}>
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
        <CustomTable width={1} headers={headers} data={data}/>
        <div className="default-header">Current Images</div>
        {currentImages}
    </>;
}


export default AdminGametypesImages;