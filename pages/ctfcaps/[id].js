import React from "react";
import Session from "../../api/session";
import DefaultHead from "../../components/defaulthead";
import Footer from "../../components/Footer";
import Nav from "../../components/Nav";
import SiteSettings from "../../api/sitesettings";
import CTF from "../../api/ctf";
import Maps from "../../api/maps";
import MapFastestCaps from "../../components/MapFastestCaps";
import Functions from "../../api/functions";

class CTFCaps extends React.Component{

    constructor(props){

        super(props);

        let selected = -1;

        const maps = JSON.parse(this.props.maps);

        if(maps.length > 0){
            selected = maps[0].id;
        }

        this.state = {"selectedMap": selected, "perPage": 25, "page": 0, "type": 0};

        this.changeSelected = this.changeSelected.bind(this);
    }

    changeSelected(e){

        this.setState({"selectedMap": e.target.value});
    }

    /*async loadData(mapId){

        try{

            return;
            console.log(`load data for map ${mapId}`);

            let typeName = "all";

            if(this.state.type !== 0){

                if(this.state.type === 1){
                    typeName = "solo";
                }else if(this.state.type === 2){
                    typeName = "assists";
                }
            }

            const req = await fetch("/api/ctf", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({
                    "mode": "fastestcaps", 
                    "perPage": this.state.perPage, 
                    "page": this.state.page,
                    "type": typeName,
                    "mapId": mapId
                })
            });

            const res = await req.json();

            console.log(res);

        }catch(err){
            console.trace(err);
        }
    }*/

    async componentDidMount(){

        //await this.loadData(this.state.selectedMap);
    }


    renderMapsForm(){

        const maps = JSON.parse(this.props.maps);

        const options = [];

        let selected = this.state.selectedMap;

        for(let i = 0; i < maps.length; i++){

            const m = maps[i];

            if(i === 0 && selected === -1){
                selected = m.id;
               // this.setState({"selectedMap": m.id});
            }

            options.push(<option key={i} value={m.id}>{m.name}</option>);
        }

        return <div>
            <div className="form">
                <div className="default-sub-header-alt">Choose a Map</div>
                <div className="select-row">
                    <div className="select-label">
                        Map
                    </div>
                    <div>
                        <select className="default-select" defaultValue={selected} onChange={this.changeSelected}>
                            {options}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    }

    render(){

        const title = "CTF Cap Records";

        return <div>
            <DefaultHead title={`${title}`} 
                description={`desc.`} 
                host={this.props.host}
                keywords={``}
            />
            <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                <div id="content">
                    <div className="default">
                        <div className="default-header">Capture The Flag Cap Records</div>
                        {this.renderMapsForm()}
                        <MapFastestCaps host={Functions.getImageHostAndPort(this.props.host)} mapId={this.state.selectedMap}/>
                    </div>
                </div>
            </main>
            <Footer session={this.props.session}/>
        </div>
    }
}


export default CTFCaps;

export async function getServerSideProps({req, query}){

    const session = new Session(req);

    await session.load();

    const navSettings = await SiteSettings.getSettings("Navigation");

    const ctfManager = new CTF();
    const validMaps = await ctfManager.getAllMapsWithCaps();
    // const records = await ctfManager.getMapsCapRecords(validMaps);

    //console.log(records);

    const mapManager = new Maps();

    const mapNames = await mapManager.getNamesByIds(validMaps);

    

    return {
        "props": {
            "host":  req.headers.host,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "maps": JSON.stringify(mapNames)
        }
    }
}