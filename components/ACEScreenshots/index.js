import React from "react";
import CountryFlag from "../CountryFlag";
import Functions from "../../api/functions";
import Link from 'next/link';
import SimplePaginationLinks from "../SimplePaginationLinks";
import Table2 from "../Table2";

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

    }

    renderData(){

        const rows = [];

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            rows.push(<tr key={i}>
                <td><Link href={`/ace/?mode=players&name=${d.player}`}><CountryFlag host={this.props.host} country={d.country}/>{d.player}</Link></td>
                <td><Link href={`/ace/?mode=players&ip=${d.ip}`}>{d.ip}</Link></td>
                <td>{Functions.convertTimestamp(d.timestamp, true)}</td>
                <td>
                    <Link href={`/ace/?mode=players&hwid=${d.hwid}`}><span className="yellow">HWID: </span>{d.hwid}</Link><br/>
                    <Link href={`/ace/?mode=players&mac1=${d.mac1}`}><span className="yellow">MAC1: </span>{d.mac1}</Link><br/>
                    <Link href={`/ace/?mode=players&mac2=${d.mac2}`}><span className="yellow">MAC2: </span>{d.mac2}</Link>
                </td>
                <td>{d.admin_name}</td>
                <td><Link href={`/ace/?mode=screenshot&logId=${d.id}`}>View</Link></td>
            </tr>);
        }

        return <div>
            <Table2 width={1} players={true}>
                <tr>
                    <th>Player</th>
                    <th>IP</th>
                    <th>Date</th>
                    <th>Hardware Info</th>
                    <th>Requested By</th>
                    <th>Actions</th>
                </tr>
                {rows}
            </Table2>
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