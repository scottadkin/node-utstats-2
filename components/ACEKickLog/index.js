import React from 'react';
import styles from './ACEKickLog.module.css';

class ACEKickLog extends React.Component{

    constructor(props){

        super(props);
        this.state = {"data": null};
    }

    async loadLog(){

        try{

            const req = await fetch("/api/ace",{
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "kick-log", "id": this.props.id})
            });

            const res = await req.json();

            if(res.error === undefined){
                this.setState({"data": res.data});
            }

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){
        await this.loadLog();
    }

    renderRawData(rawData){

        const tempLines = rawData.split(/^(.+?)$/img);

        const lines = [];

        for(let i = 0; i < tempLines.length; i++){

            const t = tempLines[i];

            if(t.toLowerCase().startsWith("[ace")){
                lines.push(t);
            }
        }

        const rows = [];

        for(let i = 0; i < lines.length; i++){

            rows.push(<div key={i} className={styles.line}>
                <div>{i+1}</div>
                <div>{lines[i]}</div>
                </div>);
        }

        return <div>
            <div className="default-sub-header">Raw Log Data</div>
            <div className={styles.raw}>
                {rows}
            </div>
        </div>
    }

    renderLog(){

        if(this.state.data === null){

            return <div className="default-header">Loading log...</div>
        }else{

            const d = this.state.data;

            return <div>
                <div className="default-header">{d.file}</div>

                {this.renderRawData(d.raw_data)}
            </div>
        }
    }

    render(){
        return <div>
            

            {this.renderLog()}
        </div>
    }
}

export default ACEKickLog;