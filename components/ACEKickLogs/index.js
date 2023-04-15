import React from 'react';
import Link from 'next/link';
import CountryFlag from '../CountryFlag';
import Functions from '../../api/functions';
import SimplePaginationLinks from '../SimplePaginationLinks';
import Table2 from '../Table2';

class ACEKickLogs extends React.Component{

    constructor(props){

        super(props);
        this.state = {"pages": 1, "mode": "default", "errors": [], "logs": [], "results": 0};

    }

    async loadPage(page){

        try{

            this.setState({"errors": []});

            const req = await fetch("/api/ace", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "kick-logs", "page": page, "perPage": this.props.perPage})
            });


            const res = await req.json();

            if(res.errors !== undefined){

                this.setState({"errors": res.errors});

            }else{

                let pages = Math.ceil(res.results / this.props.perPage);

                this.setState({
                    "logs": res.data,
                    "results": res.results,
                    "pages": pages
                });
            }

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        if(this.state.mode === "default"){
            await this.loadPage(this.props.page);
        }
    }

    async componentDidUpdate(prevProps){

        if(this.props.page !== prevProps.page){
            await this.loadPage(this.props.page);
        }
    }

    renderLogList(){

        const rows = [];

        for(let i = 0; i < this.state.logs.length; i++){

            const d = this.state.logs[i];

            rows.push(<tr key={i}>
                <td><Link href={`/ace?mode=players&name=${d.name}`}><CountryFlag host={this.props.host} country={d.country}/>{d.name}</Link></td>
                <td>{Functions.convertTimestamp(d.timestamp, true)}</td>
                <td><Link href={`/ace?mode=players&ip=${d.ip}`}>{d.ip}</Link></td>
                <td>
                    <Link href={`/ace?mode=players&hwid=${d.hwid}`}><span className="yellow">HWID: </span>{d.hwid}</Link><br/>
                    <Link href={`/ace?mode=players&mac1=${d.mac1}`}><span className="yellow">MAC1: </span>{d.mac1}</Link><br/>
                    <Link href={`/ace?mode=players&mac2=${d.mac1}`}><span className="yellow">MAC2: </span>{d.mac2}</Link>
                </td>
                <td>
                    <span className="yellow">Reason: </span>{d.kick_reason}<br/>
                    <span className="yellow">Package Name: </span>{d.package_name}<br/>
                    <span className="yellow">Package Version: </span>{d.package_version}
                </td>
                <td>
                    <Link href={`/ace?mode=kick&logId=${d.id}`}>View</Link>
                </td>
            </tr>);
        }

        return <div>
            <Table2 width={1} players={true}>
                <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>IP</th>
                    <th>Hardware Info</th>
                    <th>Kick Info</th>
                    <th>View Log</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Kick Logs</div>
            <SimplePaginationLinks url={`/ace?mode=kicks&page=`} page={this.props.page} totalPages={this.state.pages} 
            totalResults={this.state.results}/>

            {this.renderLogList()}
        </div>
    }
}

export default ACEKickLogs;