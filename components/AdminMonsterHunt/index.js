import React from 'react';
import TrueFalse from '../TrueFalse';


class AdminMonsterHunt extends React.Component{

    constructor(props){

        super(props);

        this.bulkUpload = this.bulkUpload.bind(this);
        this.singleUpload = this.singleUpload.bind(this);

    }

    async bulkUpload(e){

        try{

            e.preventDefault();

            const errors = [];

            if(e.target[0].files.length > 0){

                const formData = new FormData();

                for(let i = 0; i < e.target[0].files.length; i++){

                    formData.append("files", e.target[0].files[i]);
                }

                const req = await fetch("/api/adminmonsterhunt", {
                    "method": "POST",
                    "body": formData
                });

            }else{
                errors.push("You have not selected any files to upload");
            }

        }catch(err){
            console.trace(err);
        }
    }

    async singleUpload(e){

        try{

            e.preventDefault();

            const errors = [];

            console.log(e.target[0]);
            console.log(e.target[1]);

            const name = e.target[0].value;

            if(e.target[1].files[0] === undefined){
                errors.push("You have not selected a file to upload.");
            }


            if(errors.length === 0){

                const file = e.target[1].files[0];

                const formData = new FormData();

                formData.append("fileName", name);
                formData.append("single", true);
                formData.append("file", file);


                console.log(formData);

                const req = await fetch("/api/adminmonsterhunt", {
                    "method": "POST",
                    "body": formData
                });

                const result = await req.json();

                console.log(result);
            }
          

        }catch(err){
            console.trace(err);
        }
    }


    getImageStatus(name){

        name = `${name}.png`;

        let image = 0;

        for(let i = 0; i < this.props.images.length; i++){

            image = this.props.images[i];

            if(name === image) return true;
        }

        return false;
    }

    renderTable(){

        const rows = [];

        let m = 0;

        for(let i = 0; i < this.props.monsters.length; i++){

            m = this.props.monsters[i];

            rows.push(<tr key={i}>
                <td>{m.class_name}</td>
                <td>{m.display_name}</td>
                <td>{m.matches}</td>
                <td>{m.deaths}</td>
                <TrueFalse bTable={true} value={this.getImageStatus(m.class_name)} tDisplay="Found" fDisplay="Missing"/>
                <td>
                    <form action="/" method="POST" onSubmit={this.singleUpload}>
                        <input type="hidden" value={m.class_name}/>
                        <input type="file" accept=".png" />
                        <input type="submit" value="Upload"/>
                    </form>
                </td>
            </tr>);
        }

        return <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Class Name</th>
                    <th>Display Name</th>
                    <th>Matches Seen</th>
                    <th>Total Deaths</th>
                    <th>Image Status</th>
                    <th>Upload</th>
                </tr>
                {rows}
            </tbody>
        </table>
    }

    render(){

        console.table(this.props.images);

        return <div>
            <div className="default-header">MonsterHunt Monster Image Uploader</div>

            <form className="form m-bottom-25" action="/" method="POST" onSubmit={this.bulkUpload}>
                <div className="form-info">
                    Image format must be .png.<br/>
                    File name must the the monster's classname in lowercase.<br/>
                    Bulk image uploads do not auto set there names.<br/>
                    Single image upload automatically sets their names.<br/>
                </div>

                <div className="default-header">Bulk Uploader</div>

                <input type="file" className="m-bottom-25" multiple accept=".png"/>

                <input type="submit" className="search-button" value="Upload"/>
            </form>

            {this.renderTable()}
        </div>
    }
}


export default AdminMonsterHunt;