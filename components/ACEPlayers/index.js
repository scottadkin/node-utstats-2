import React from 'react';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';

class ACEPlayers extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "name": "",
            "ip": "",
            "hwid": "",
            "mac1": "",
            "mac2": "",
            "searchInProgress": false,
            "searchFailed": null,
            "searchError": "",
            "searchData": []
        }

        this.playerSearch = this.playerSearch.bind(this);
        this.updateValue = this.updateValue.bind(this);
    }

    updateValue(name, value){

        const obj = {};

        obj[name] = value;
        Functions.setCookie(`ACE-${name}`, value);

    }

    async playerSearch(e){

        try{

            e.preventDefault();

            const name = e.target[0].value;
            const ip = e.target[1].value;
            const hwid = e.target[2].value;
            const mac1 = e.target[3].value;
            const mac2 = e.target[4].value;
            
            this.setState({"searchInProgress": true, "searchFailed": null, "searchError": ""});

            const req = await fetch("/api/ace", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify(
                    {
                        "mode": "player-search",
                        "name": name,
                        "ip": ip,
                        "hwid": hwid,
                        "mac1": mac1,
                        "mac2": mac2
                    }
                )
            });

            const res = await req.json();

            let failed = true;

            if(res.error === undefined){

                failed = false;
                this.setState({"searchData": res.data});

            }else{
                this.setState({"searchError": res.error});
            }

            this.setState({"searchInProgress": false, "searchFailed": failed});

            console.log(res.data);

        }catch(err){
            console.trace(err);
        }
    }

    componentDidMount(){

        const cookies = this.getCookieArray();

        this.setState({
            "name": cookies.name,
            "ip": cookies.ip,
            "hwid": cookies.hwid,
            "mac1": cookies.mac1,
            "mac2": cookies.mac2
        });

        

    }

    getCookieArray(){

        const cookies = document.cookie.split(`;`);

        const reg = /^.+?-(.+?)=(.*)$/i;

        const aceCookies = {};

        for(let i = 0; i < cookies.length; i++){

            const c = cookies[i].trim();

            if(c.startsWith("ACE")){

                const result = reg.exec(c);

                if(result !== null){
                    aceCookies[result[1]] = result[2];
                }else{
                    console.trace(`reg is null(get cookie array)`);
                }
            }
        }

        if(aceCookies.name === undefined) Functions.setCookie("ACE-name", "");
        if(aceCookies.ip === undefined) Functions.setCookie("ACE-ip", "");
        if(aceCookies.hwid === undefined) Functions.setCookie("ACE-hwid", "");
        if(aceCookies.mac1 === undefined) Functions.setCookie("ACE-mac1", "");
        if(aceCookies.mac2 === undefined) Functions.setCookie("ACE-mac2", "");

        return aceCookies;   
    }

    renderStatus(){

        if(!this.state.searchInProgress && this.state.searchFailed === null) return null;

        let color = "";
        let title = "";
        let info = "";
        let error = this.state.searchError;

        if(this.state.searchInProgress){
            color = "yellow";
            title = "Search In Progress";
            info = "Search in progress please wait...";
        }

        if(this.state.searchFailed !== null){

            if(this.state.searchFailed === true){
                color = "red";
                title = "Search Failed";
                info = `There was a problem during the search.`;
            }else{
                color = "green";
                title = "Search Successfull";
                info = "Search was completed successfully.";
            }
        }

        return <div className={`team-${color} t-width-1 center p-bottom-25`}>
            <div className="default-sub-header">{title}</div>
            {info}
            {(error !== "") ? <b><br/><br/>{error}</b> : null}
        </div>
    }


    renderSearchResult(){

        if(this.state.searchData.length === 0) return null;

        const rows = [];

        for(let i = 0; i < this.state.searchData.length; i++){

            const d = this.state.searchData[i];

            const lastKicked = (d.last_kick === 0) ? "Never" : Functions.convertTimestamp(d.last_kick, true);

            rows.push(<tr key={i}>
                <td>
                    <Link href={`/ace/?mode=player&name=${d.name}`}>
                        <a><CountryFlag country={d.country}/>{d.name}</a>
                    </Link>
                </td>
                <td>{d.ip}</td>
                <td>
                    <span className="yellow">HWID:</span> {d.hwid}<br/>
                    <span className="yellow">MAC1:</span> {d.mac1}<br/>
                    <span className="yellow">MAC2:</span> {d.mac2}
                </td>
                <td>
                    <span className="yellow">First:</span> {Functions.convertTimestamp(d.first, true)}<br/>
                    <span className="yellow">Last:</span> {Functions.convertTimestamp(d.last, true)}
                </td>
                <td>{d.times_connected}</td>
                <td>
                    <span className="yellow">Times Kicked:</span> {d.times_kicked}<br/>
                    <span className="yellow">Last:</span> {lastKicked}
                </td>
               
            </tr>);
        }

        return <div>
            <div className="default-sub-header">Search Result</div>
            <table className="t-width-1 m-bottom-25">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>IP</th>
                        <th>Hardware Info</th>
                        <th>Dates</th>
                        <th>Times Connected</th>
                        <th>Kicks</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    createFormRow(label, type, defaultValue){

        return <div className="select-row">
                <div className="select-label">
                    {label}
                </div>
                <div>
                    <input type="text" className="default-textbox" defaultValue={defaultValue} name={type} 
                        onChange={((e) =>{ this.updateValue(type, e.target.value) })}
                        onKeyDown={((e) =>{ this.updateValue(type, e.target.value) })}
                        onKeyUp={((e) =>{ this.updateValue(type, e.target.value) })}
                    />
                </div>
         </div>

    }

    render(){

        return <div>
            <div className="default-header">Players</div>
            <div className="default-sub-header">Search for a player</div>
            <div className="form m-bottom-25">
                <form action="/" method="POST" onSubmit={this.playerSearch}>
                    <div className="form-info">
                        Search for a player using one or multiple parameters.<br/>
                        Click on a players name in the search result area to be taken to their full report.
                    </div>
           
                    {this.createFormRow("Name", "name", this.state.name)}
                    {this.createFormRow("IP", "ip", this.state.ip)}      
                    {this.createFormRow("HWID", "hwid", this.state.hwid)}
                    {this.createFormRow("MAC1", "mac1", this.state.mac1)}
                    {this.createFormRow("MAC2", "mac2", this.state.mac2)}
                     

                    <input type="submit" className="search-button" value="Search"/>
                </form>
            </div>
            {this.renderStatus()}
            {this.renderSearchResult()}
        </div>
    }
}


export default ACEPlayers;