import React from 'react';
import Loading from '../Loading';
import Table2 from '../Table2';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';

class AdminPlayerSearch extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "nameResults": [],
            "ipResults": [],
            "bLoading": false,
            "error": null,
            "nameSearch": "",
            "ipSearch": "",

        };
        this.search = this.search.bind(this);
    }

    async search(e){

        try{

            e.preventDefault();
   
            const name = e.target[0].value;
            const ip = e.target[1].value;

            this.setState({
                "nameResults": [], 
                "ipResults": [], 
                "nameSearch": name,
                "ipSearch": ip,
                "error": null,
                "bLoading": true
            });

            const body = {};

            if(name.length > 0){
                body.name = name;
            }

            if(ip.length > 0){
                body.ip = ip;
            }
            
            if(body.name !== undefined && body.ip !== undefined){

                body.mode = "nameip";

            }else if(body.name !== undefined){

                body.mode = "namesearch";

            }else if(body.ip !== undefined){

                body.mode = "ipsearch";

            }

            const req = await fetch("/api/adminplayers", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify(body)
            });


            const res = await req.json();

            if(res.error === undefined){

                this.setState({
                    "nameResults": res.names ?? [], 
                    "ipResult": res.ips ?? [], 
                    "bLoading": false,
                    "error": null
                });

            }else{

                this.setState({
                    "nameResults": [], 
                    "ipResults": [],
                    "bLoading": false, 
                    "error": res.error
                });
            }


            

            console.log(res);
            
            

        }catch(err){
            console.trace(err);
        }
    }


    renderNameSearch(){

        let elems = null;


        if(this.state.bLoading){

            elems = <Loading />;
        }

        if(this.state.error !== null){

            elems = <div>
                {this.state.error}
            </div>
        }

        if(this.state.nameResults.length > 0){

            const names = [];

            for(let i = 0; i < this.state.nameResults.length; i++){

                const r = this.state.nameResults[i];

                names.push(<tr key={i}>
                    <td className="text-left"><Link href={`/player/${r.player_id}`}><a>{r.name}</a></Link></td>
                    <td>{r.ip} <CountryFlag country={r.country}/></td>
                    <td>{Functions.convertTimestamp(r.first, true)}</td>
                    <td>{Functions.convertTimestamp(r.last, true)}</td>
                    <td>{Functions.toHours(r.playtime)} Hours</td>
                    <td>{r.total_matches}</td>
                </tr>);
            }

            elems = <Table2 width={1}>
                <tr>
                    <th>Name</th>
                    <th>IP</th>
                    <th>First</th>
                    <th>Last</th>
                    <th>Playtime</th>
                    <th>Matches</th>
                </tr>
                {names}
            </Table2>

        }


        return <div>
            <div className="default-header">Name Search Result for "{this.state.nameSearch}"</div>
            {elems}
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Player Search</div>

            <div className="form">
                <form action="/" method="POST" onSubmit={this.search}>
                    <div className="form-info m-bottom-25">
                        Search for a player by name or IP.
                    </div>
                    <div className="select-row">
                        <div className="select-label">Name</div>
                        <div>
                            <input type="textbox" className="default-textbox" placeholder="Name..."/>
                        </div>
                    </div>
                    <div className="select-row">
                        <div className="select-label">IP</div>
                        <div>
                            <input type="textbox" className="default-textbox" placeholder="IP..."/>
                        </div>
                    </div>
                    <input type="submit" className="search-button" value="Search"/>
                </form>
            </div>
            {this.renderNameSearch()}
        </div>
    }
}

export default AdminPlayerSearch;