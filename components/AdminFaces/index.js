import React from 'react';
import Functions from '../../api/functions';


class AdminFaces extends React.Component{

    constructor(props){

        super(props);

        this.singleSubmit = this.singleSubmit.bind(this);
    }


    async singleSubmit(e){

        try{

            e.preventDefault();

            console.log(e);

            let fileName = e.target[0].value;
            let file = e.target[1].files[0];

            console.log(fileName);
            console.log(file);

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

            console.log(res);

        }catch(err){
            console.trace(err);
        }

    }

    displayAll(){

        const rows = [];

        const data = JSON.parse(this.props.data);
        const files = JSON.parse(this.props.files);

        let d = 0;

        let currentIndex = 0;

        for(let i = 0; i < data.length; i++){

            d = data[i];

            currentIndex = files.indexOf(`${d.name.toLowerCase()}.png`);

            rows.push(<tr key={i}>
                <td><img src={`/images/faces/${(currentIndex !== -1) ? d.name.toLowerCase() : "faceless" }.png`} alt="face" /></td>
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

        return <table className="table-width-1 td-1-left">
            <tbody>
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
            </tbody>
        </table>;
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
                    
                </div>
            </div>

            <div className="default-header">Bulk Face Image Uploader</div>

            <div className="default-header">Single Upload</div>
            {this.displayAll()}
        </div>
    }
}


export default AdminFaces;