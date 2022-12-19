import React from "react";
import DefaultHead from "../../components/defaulthead";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import SiteSettings from "../../api/sitesettings";
import Session from "../../api/session";
import Servers from "../../api/servers";
import ErrorMessage from "../../components/ErrorMessage";
import Table2 from "../../components/Table2";
import Countries from "../../api/countries";
import CountryFlag from "../../components/CountryFlag";
import Functions from "../../api/functions";
import ServerRecentPings from "../../components/ServerRecentPings";

class ServerPage extends React.Component{

    constructor(props){

        super(props);     
    }

    renderBasicInfo(data){

        const country = Countries(data.country);

        return <div>
            <div className="default-header">Basic Summary</div>
            <Table2 width={1}>
                <tr>
                    <th>IP</th>
                    <th>Port</th>
                    <th>Country</th>
                    <th>Password</th>
                    <th>Total Matches</th>
                    <th>Total Playtime</th>
                </tr>
                <tr>
                    <td>
                        {data.ip}
                    </td>
                    <td>
                        {data.port}
                    </td>
                    <td>
                        <CountryFlag country={country.code}/> {country.country}
                    </td>
                    <td>
                        {data.password}
                    </td>
                    <td>
                        {data.matches}
                    </td>
                    <td className="playtime">
                        {Functions.toPlaytime(data.playtime)}
                    </td>
                </tr>
            </Table2>
        </div>
    }


    renderElems(data){

        return <div>
            <div className="default-header">
                {data.name}&nbsp;
                <span className="yellow">{data.ip}:{data.port}</span>
            </div>
            {this.renderBasicInfo(data)}
            <ServerRecentPings serverId={this.props.serverId}/>
        </div>
    }

    render(){

        let elems = [];
        let title = "";
        let description = "";

        if(this.props.details === "null"){

            title = "Server does not exist.";
            description = "There is no information for this server, it doesn't exist.";

            elems = <div>
                <div className="default-header">Server Page</div>
                <ErrorMessage title="Server Page" text="There is no server with that id."/>
            </div>;

        }else{

            const details = JSON.parse(this.props.details);

            description = `View information about the server ${details.name}.`;
            title = details.name;

            elems = this.renderElems(details);
        }

        return <div>
            <DefaultHead host={this.props.host} title={title} description={description} keywords="server"/>
            <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                <div id="content">
                    <div className="default">
                        {elems}
                    </div>
                </div>
                <Footer session={this.props.session}/>
            </main>
        </div>
    }
}


export async function getServerSideProps({req, query}){

    const siteSettings = new SiteSettings();

	const pageSettings = await siteSettings.getCategorySettings("Server");
	const pageOrder = await siteSettings.getCategoryOrder("Server");
	const navSettings = await siteSettings.getCategorySettings("Navigation");

    const session = new Session(req);

    await session.load();

    const serverManager = new Servers();

    let serverId = query.id ?? 0;

    serverId = parseInt(serverId);

    if(serverId !== serverId) serverId = 0;

    const details = await serverManager.getDetails(serverId);

    return {
        "props":{
            "host": req.headers.host,
            "navSettings": JSON.stringify(navSettings),
            "pageSettings": JSON.stringify(pageSettings),
            "session": JSON.stringify(session.settings),
            "serverId": serverId,
            "details": JSON.stringify(details)
        }
    };
}

export default ServerPage;