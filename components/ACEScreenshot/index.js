import React from 'react';
import Functions from '../../api/functions';
import styles from '../ACEKickLog/ACEKickLog.module.css';
import Table2 from '../Table2';
import Image from 'next/image';


class ACEScreenshot extends React.Component{

    constructor(props){

        super(props);
        this.state = {"data": null};
    }

    async componentDidMount(){

        try{

            const req = await fetch("/api/ace", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "sshot", "id": this.props.id})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({"data": res.data});
            }

        }catch(err){
            console.trace(err);
        }
    }

    createCleanImageUrl(file){

        const reg = /^.*\/(.+)$/i;
        const result = reg.exec(file);
        let image = `./${this.props.host}/images/temp2.jpg`;

        if(result !== null) image = `${this.props.host}/ace/${result[1]}`;

        return image;
    }

    renderRawLog(){

        const lines = this.state.data.raw_data.split(/^(.+)$/img);
        const elems = [];

        for(let i = 0; i < lines.length; i++){

            const l = lines[i];

            if(l.toLowerCase().startsWith("[ace")){
                
                elems.push(<div key={i} className={styles.line}><div>{elems.length + 1}</div><div>{l}</div></div>);
            }
        }


        return <div>
            <div className="default-sub-header">Raw Log</div>
            <div className={styles.raw}>
                {elems}
            </div>
            </div>
    }

    renderMain(){

        if(this.state.data === null) return <div><div className="default-header">ACE Screenshot</div></div>;

        const d = this.state.data;    
        const image = this.createCleanImageUrl(d.screenshot_file);

        return <div>
            <div className="default-header m-bottom-25">{d.file}</div>

            <Table2 width={2} players={true}>
                <tr>
                    <td className="yellow">Date</td>
                    <td>{Functions.convertTimestamp(d.timestamp)}</td>
                </tr>
                <tr>
                    <td className="yellow">Requested By</td>
                    <td>{d.admin_name}</td>
                </tr>
            </Table2>

            <div className="default-sub-header">Screenshot</div>
            <a href={image} rel="noreferrer" target="_blank"><img src={image} className="t-width-3 m-bottom-25" alt="image"/></a>

            {this.renderRawLog()}
        </div>
        
    }

    render(){

        return <div>
            

            {this.renderMain()}
        </div>
    }
}

export default ACEScreenshot;