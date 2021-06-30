import React from 'react';
import TrueFalse from '../TrueFalse';


class AdminMonsterHunt extends React.Component{

    constructor(props){

        super(props);
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
                <td><input type="text" id={`name-${m.id}`} className="default-textbox" value={m.display_name}/></td>
                <td>{m.matches}</td>
                <td>{m.deaths}</td>
                <TrueFalse bTable={true} value={this.getImageStatus(m.class_name)} tDisplay="Found" fDisplay="Missing"/>
                <td><input type="file" id={`file-${m.class_name}`} accept=".png" /><input type="button" value="Upload"/></td>
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

            <form className="form m-bottom-25" action="/" method="POST">
                <div className="form-info">
                    Image format must be .png.<br/>
                    File name must the the monster's classname in lowercase.<br/>
                    Bulk image uploads do not auto set there names.<br/>
                    Single image upload automatically sets their names.<br/>
                </div>

                <div className="default-header">Bulk Uploader</div>

                <input type="file" className="m-bottom-25" multiple accept="png"/>

                <input type="submit" className="search-button" value="Upload"/>
            </form>

            {this.renderTable()}
        </div>
    }
}


export default AdminMonsterHunt;