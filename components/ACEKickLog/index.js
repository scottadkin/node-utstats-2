import React from 'react';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag';
import styles from './ACEKickLog.module.css';
import Link from 'next/link';
import Table2 from '../Table2';
import Image from 'next/image';

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

            let sshotLoc = d.screenshot_file;

            const reg = /^.+(\[ace.+)$/i;

            const result = reg.exec(sshotLoc);

            if(result !== null){
                sshotLoc = result[1];
            }

            return <div>
                <div className="default-header">{d.file}</div>
                <div className="default-sub-header"><span className="yellow">{d.name}</span> Kicked for <span className="yellow">{d.kick_reason}</span></div>
                {this.renderTable()}
                <div className="default-sub-header">Kick Screenshot</div>
                <Image src={`${this.props.host}images/ace/${sshotLoc}`} width={1920} height={1080} className="t-width-1 m-bottom-25" alt="image"/>
                {this.renderRawData(d.raw_data)}
            </div>
        }
    }

    renderTable(){

        const rows = [];


        const d = this.state.data;

        return <div className={styles.table}>
            <Table2 width={1}>
                <tr>
                    <th>Type</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Date</td>
                    <td>{Functions.convertTimestamp(d.timestamp, true)}</td>
                </tr>
                <tr>
                    <td>Name</td>
                    <td><Link href={`/ace?mode=player&name=${d.name}`}><a><CountryFlag host={this.props.host} country={d.country}/>{d.name}</a></Link></td>
                </tr>
                <tr className="yellow">
                    <td>Kick Reason</td>
                    <td>{d.kick_reason}</td>
                </tr>
                <tr className="yellow">
                    <td>Package Name</td>
                    <td>{d.package_name}</td>
                </tr>
                <tr className="yellow">
                    <td>Package Version</td>
                    <td>{d.package_version}</td>
                </tr>
                <tr>
                    <td>IP</td>
                    <td><Link href={`/ace?mode=players&ip=${d.ip}`}><a>{d.ip}</a></Link></td>
                </tr>
                <tr>
                    <td>OS</td>
                    <td>{d.os}</td>
                </tr>
                <tr>
                    <td>CPU</td>
                    <td>{d.cpu} <span className="yellow">Detected at {(d.cpu_speed / 1000).toFixed(2)}GHz</span></td>
                </tr>
                <tr>
                    <td>MAC1</td>
                    <td><Link href={`/ace?mode=players&mac1=${d.mac1}`}><a>{d.mac1}</a></Link></td>
                </tr>
                <tr>
                    <td>MAC2</td>
                    <td><Link href={`/ace?mode=players&mac2=${d.mac2}`}><a>{d.mac2}</a></Link></td>
                </tr>
                <tr>
                    <td>HWID</td>
                    <td><Link href={`/ace?mode=players&hwid=${d.hwid}`}><a>{d.hwid}</a></Link></td>
                </tr>
                <tr>
                    <td>Game Version</td>
                    <td>{d.game_version}</td>
                </tr>
                <tr>
                    <td>Renderer</td>
                    <td>{d.renderer}</td>
                </tr>
                <tr>
                    <td>Audio Device</td>
                    <td>{d.sound_device}</td>
                </tr>
                <tr>
                    <td>Command Line</td>
                    <td>{d.command_line}</td>
                </tr>
            </Table2>
        </div>
    }

    render(){
        return <div>
            
            {this.renderLog()}
        </div>
    }
}

export default ACEKickLog;