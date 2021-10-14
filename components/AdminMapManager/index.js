import React from 'react';
import Functions from '../../api/functions';
import TrueFalse from '../TrueFalse';

class AdminMapManager extends React.Component{

    constructor(props){

        super(props);
        this.state = {"fullsize": [], "thumbs": [], "names": [], "expectedFileNames": [], "finishedLoading": false};
    }

    async uploadImage(e){

        try{

            e.preventDefault();

            const name = e.target[0].name;

            const formData = new FormData();

            if(e.target[0].files.length === 0){

                alert("No File selected");
                return;
            }

            console.log(e.target[0].files);

            formData.append(name, e.target[0].files[0]);

            const req = await fetch("/api/mapimageupload",{
                "method": "POST",
                "body": formData
            });

            const res = await req.json();

            console.log(res);

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

    async componentDidMount(){

        await this.loadFileList();
        await this.loadMapNames();
        this.setState({"finishedLoading": true});
    }


    renderFileTable(){

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
                        <input type="submit" value="Upload"/>
                    </form>
                </td>
            </tr>);
        }

        return <div>
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

    render(){

        return <div>
            <div className="default-header">Map Manager</div>
            {this.renderFileTable()}
        </div>
    }
}

export default AdminMapManager;