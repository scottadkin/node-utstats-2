import React from "react";
import DefaultHead from "../components/defaulthead";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Session from "../api/session";
import SiteSettings from "../api/sitesettings";
import Analytics from "../api/analytics";
import Servers from "../api/servers";
import Table2 from "../components/Table2";
import Loading from "../components/Loading";
import Functions from "../api/functions";
import InteractiveTable from "../components/InteractiveTable";

class ServersPage extends React.Component{

    constructor(props){

        super(props);
        this.state = {"bLoading": true};
    }

    async componentDidMount(){

        this.setState({"bLoading": false});
    }


    renderBasic(){

        const rows = [];

        const servers = JSON.parse(this.props.serverList);

        for(let i = 0; i < servers.length; i++){

            const s = servers[i];

            rows.push(<tr key={s.id}>
                <td className="text-left">{s.name}</td>
                <td>{s.ip}:{s.port}</td>
                <td>{Functions.convertTimestamp(s.first, true)}</td>
                <td>{Functions.convertTimestamp(s.last, true)}</td>
                <td>{s.matches}</td>
                <td className="playtime">{Functions.toPlaytime(s.playtime)}</td>
            </tr>);
        }

        return <Table2 width={1} key="basic">
            <tr>
                <th>Name</th>
                <th>IP:Port</th>
                <th>First Match</th>
                <th>Last Match</th>
                <th>Total Matches</th>
                <th>Total Playtime</th>
            </tr>
            {rows}
        </Table2>
    }


    renderElems(){

        if(this.state.bLoading) return <Loading/>;

        const elems = [];

        elems.push(<InteractiveTable key="servers" width={1} data={this.createTableData()} headers={{
                "name": "Name",
                "address": "Address",
                "first": "First Match",
                "last": "Last Match",
                "matches": "Total Matches",
                "playtime": "Playtime"
            }}/>
        );

        return elems;
    }


    createTableData(){

        const data = [];

        const servers = JSON.parse(this.props.serverList);

        for(let i = 0; i < servers.length; i++){

            const s = servers[i];

            data.push({
                "name": {"value": s.name, "className": "text-left"},
                "address": {"value": `${s.ip}:${s.port}`},
                "first": {"displayValue": Functions.convertTimestamp(s.first, true), "value": s.first, "className": "playtime"},
                "last": {"displayValue": Functions.convertTimestamp(s.first, true), "value": s.last, "className": "playtime"},
                "matches": {"value": s.matches},
                "playtime": {"displayValue": Functions.toPlaytime(s.playtime), "value": s.playtime, "className": "playtime"},
            });
        }

        return data;
    }

    render(){

        return <div>
		<DefaultHead host={this.props.host} title={"Servers"} description="" keywords="server"/>	
		<main>
			<Nav settings={this.props.navSettings} session={this.props.session}/>
			<div id="content">
				<div className="default">
			
                <div className="default-header">Servers</div>
                
                {this.renderElems()}
			</div>
			</div>
			<Footer session={this.props.session}/>
		</main>   
		</div>
    }
}

export async function getServerSideProps({req, query}){

    const session = new Session(req);

    await session.load();

    const siteSettings = new SiteSettings();

	const pageSettings = await siteSettings.getCategorySettings("Servers");
	const pageOrder = await siteSettings.getCategoryOrder("Servers");
	const navSettings = await siteSettings.getCategorySettings("Navigation");

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers["user-agent"]);


    const serverManager = new Servers();

    const serverList = await serverManager.getAll();

    return {
        "props": {
            "navSettings": JSON.stringify(navSettings),
            "pageSettings": JSON.stringify(pageSettings),
            "pageOrder": pageOrder,
            "session": JSON.stringify(session.settings),
            "host": req.headers.host,
            "serverList": JSON.stringify(serverList)
        }
    }

}

export default ServersPage;