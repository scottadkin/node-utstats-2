import React from "react";
import CountryFlag from "../CountryFlag";
import Functions from "../../api/functions";
import Link from 'next/link';
import SimplePaginationLinks from "../SImplePaginationLinks";

class ACEScreenshots extends React.Component{

    constructor(props){

        super(props);
        this.state = {"data": [], "pages": 1, "results": 0};

    }

    async componentDidMount(){

        try{

            await this.loadData(1);

        }catch(err){    
            console.trace(err);
        }
    }

    async componentDidUpdate(preProps){

        if(preProps.page !== this.props.page){
            await this.loadData(this.props.page);
        }
    }

    async loadData(page){

        console.log("DATA");

        const req = await fetch("/api/ace", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "sshots", "page": page})
        });

        const res = await req.json();

        if(res.error === undefined){

            const pages = (res.results > 0) ? Math.ceil(res.results / 25) :1;
            this.setState({"data": res.data, "results": res.results, "pages": pages});
        }
        console.log(res);

    }

    renderData(){

        const rows = [];

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            rows.push(<tr key={i}>
                <td><Link href={`/ace/?mode=players&name=${d.player}`}><a><CountryFlag country={d.country}/>{d.player}</a></Link></td>
                <td><Link href={`/ace/?mode=players&ip=${d.ip}`}><a>{d.ip}</a></Link></td>
                <td>{Functions.convertTimestamp(d.timestamp, true)}</td>
                <td>
                    <Link href={`/ace/?mode=players&hwid=${d.hwid}`}><a><span className="yellow">HWID: </span>{d.hwid}</a></Link><br/>
                    <Link href={`/ace/?mode=players&mac1=${d.mac1}`}><a><span className="yellow">MAC1: </span>{d.mac1}</a></Link><br/>
                    <Link href={`/ace/?mode=players&mac2=${d.mac2}`}><a><span className="yellow">MAC2: </span>{d.mac2}</a></Link>
                </td>
                <td>{d.admin_name}</td>
                <td><Link href={`/ace/?mode=screenshot&logId=${d.id}`}><a>View</a></Link></td>
            </tr>);
        }

        return <div>
            <table className="t-width-1">
                <tbody>
                    <tr>
                        <th>Player</th>
                        <th>IP</th>
                        <th>Date</th>
                        <th>Hardware Info</th>
                        <th>Requested By</th>
                        <th>Actions</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Screenshot Requests</div>
            <SimplePaginationLinks url={`/ace?mode=screenshots&page=`} page={this.props.page} totalPages={this.state.pages} totalResults={this.state.results}/>
            {this.renderData()}
        </div>
    }
}

export default ACEScreenshots;