import React from 'react';
import Functions from '../../api/functions';

class ACEPlayers extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "name": "",
            "ip": "",
            "hwid": "",
            "mac1": "",
            "mac2": ""
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
            

            console.log(name, ip, hwid, mac1, mac2);
            

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

            console.log(res);

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
               // aceCookies.push(c);
            }
        }

        if(aceCookies.name === undefined) Functions.setCookie("ACE-name", "");
        if(aceCookies.ip === undefined) Functions.setCookie("ACE-ip", "");
        if(aceCookies.hwid === undefined) Functions.setCookie("ACE-hwid", "");
        if(aceCookies.mac1 === undefined) Functions.setCookie("ACE-mac1", "");
        if(aceCookies.mac2 === undefined) Functions.setCookie("ACE-mac2", "");

        return aceCookies;
        
    }

    render(){

        return <div>
            <div className="default-header">Players</div>
            <div className="default-sub-header">Search for a player</div>
            <div className="form">
                <form action="/" method="POST" onSubmit={this.playerSearch}>
                    <div className="form-info">
                        Search for a player using one or multiple parameters.
                    </div>
                    <div className="select-row">
                        <div className="select-label">
                            Name
                        </div>
                        <div>
                            <input type="text" className="default-textbox" defaultValue={this.state.name} name="name" onChange={((e) =>{
                                this.updateValue("name", e.target.value)
                            })}/>
                        </div>
                    </div>

                    <div className="select-row">
                        <div className="select-label">
                            IP
                        </div>
                        <div>
                            <input type="text" className="default-textbox" name="ip" defaultValue={this.state.ip}  onChange={((e) =>{
                                this.updateValue("ip", e.target.value)
                            })}/>
                        </div>
                    </div>

                    <div className="select-row">
                        <div className="select-label">
                            HWID
                        </div>
                        <div>
                            <input type="text" className="default-textbox" name="hwid" defaultValue={this.state.hwid}  onChange={((e) =>{
                                this.updateValue("hwid", e.target.value)
                            })}/>
                        </div>
                    </div>

                    <div className="select-row">
                        <div className="select-label">
                            MAC1
                        </div>
                        <div>
                            <input type="text" className="default-textbox" name="mac1" defaultValue={this.state.mac1}  onChange={((e) =>{
                                this.updateValue("mac1", e.target.value)
                            })}/>
                        </div>
                    </div>

                    <div className="select-row">
                        <div className="select-label">
                            MAC2
                        </div>
                        <div>
                            <input type="text" className="default-textbox" name="mac2" defaultValue={this.state.mac2}  onChange={((e) =>{
                                this.updateValue("mac2", e.target.value)
                            })}/>
                        </div>
                    </div>

                    <input type="submit" className="search-button" value="Search"/>
                </form>
            </div>
        </div>
    }
}


export default ACEPlayers;