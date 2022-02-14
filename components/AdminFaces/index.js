import React from 'react';
import Functions from '../../api/functions';
import Table2 from '../Table2';
import Image from 'next/image';


class AdminFaces extends React.Component{

    constructor(props){

        super(props);

        this.state = {"files": JSON.parse(this.props.files)};
        this.singleSubmit = this.singleSubmit.bind(this);
        this.bulkUpload = this.bulkUpload.bind(this);

    }


    async bulkUpload(e){

        try{

            e.preventDefault();

            const formData = new FormData();

            const fileNames = [];

            let f = 0;

            for(let i = 0; i < e.target.files.files.length; i++){

                f = e.target.files.files[i];

                formData.append(`f_${i}`, f);

                fileNames.push(f.name);

            }

            const req = await fetch("/api/faceuploader", {
                "method": "POST",
                "body": formData
            });


            const res = await req.json();

            if(res.message == "passed"){
                this.updateFileStatus(fileNames);
            }

        }catch(err){
            console.trace(err);
        }
    }

    async singleSubmit(e){

        try{

            e.preventDefault();

            let fileName = e.target[0].value;
            let file = e.target[1].files[0];

            const formData = new FormData();

            formData.append("name", fileName);
            formData.append("file", file);
            formData.append("single", true);


            const req = await fetch("/api/faceuploader", {
                "method": "POST",
                //"Content-Type": "multipart/form-data",
                "body": formData
            });


            const res = await req.json();

            if(res.message == "passed"){
                console.log("PPSPASPASPSP");
                this.updateFileStatus(fileName);
            }

        }catch(err){
            console.trace(err);
        }

    }

    updateFileStatus(name){

        const previous = this.state.files;

        if(!Array.isArray(name)){
            previous.push(`${name}.png`);
        }else{

            for(let i = 0; i < name.length; i++){
                previous.push(name[i]);
            }
        }

        this.setState({"files": previous});
    }

    displayAll(){

        const rows = [];

        const data = JSON.parse(this.props.data);
        const files = this.state.files;

        let d = 0;

        let currentIndex = 0;

        for(let i = 0; i < data.length; i++){

            d = data[i];

            currentIndex = files.indexOf(`${d.name.toLowerCase()}.png`);

            rows.push(<tr key={i}>
                <td><Image width={64} height={64} src={`/images/faces/${(currentIndex !== -1) ? d.name.toLowerCase() : "faceless" }.png`} alt="face" /></td>
                <td>{d.name.toLowerCase()}</td>
                <td>{Functions.convertTimestamp(d.first, true, true)}</td>
                <td>{Functions.convertTimestamp(d.last, true, true)}</td>
                <td>{d.uses}</td>
                <td className={(currentIndex !== -1) ? "team-green" : "team-red"}>{(currentIndex !== -1) ? "Found" : "Missing"}</td>
                <td>
                    <form action="/" method="POST" encType="multipart/form-data" onSubmit={this.singleSubmit}>
                        <input type="hidden" name="fileName" value={d.name.toLowerCase()}/>
                        <input type="file" name="file" accept={".png"} />
                        <input type="submit" value="Upload" />
                    </form>
                </td>
            </tr>);
        }

        return <Table2 width={1}>
            <tr>
                <th>Displayed</th>
                <th>Name</th>
                <th>First Used</th>
                <th>Last Used</th>
                <th>Total Uses</th>
                <th>Status</th>
                <th>Upload</th>
            </tr>
            {rows}
        </Table2>;
    }

    render(){

        return <div>
            <div className="default-header">Face Image Manager</div>

            <div className="form">
                <div className="form-info">
                    File names must be in all lowercase.<br/>
                    Files must be .png format.<br/>
                    Files must be in a 1:1 aspect ratio.<br/>
                    Files must be at least 64x64 to not look blurry.<br/>
                    File names are automatically set in Single Upload.
                    
                </div>
            </div>

            <div className="default-header">Bulk Face Image Uploader</div>

            <div className="form">
                <div className="form-info">
                    
                    <form action="/" method="POST" encType="multipart/form-data" onSubmit={this.bulkUpload}>
                        <input type="file" name="files" className="m-bottom-25 m-top-25" multiple={true} accept=".png"/>
                        <input type="submit" className="search-button" value="Upload"/>
                    </form>
                    
                </div>
            </div>

 
            <div className="default-header">Single Upload</div>

       

            {this.displayAll()}
        </div>
    }
}


export default AdminFaces;