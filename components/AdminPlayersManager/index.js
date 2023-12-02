import React from "react";
import Loading from "../Loading";
import AdminPlayerRename from "../AdminPlayerRename";
import AdminDeletePlayer from "../AdminDeletePlayer";
import BasicUIBox from "../BasicUIBox";
import AdminPlayerMerge from "../AdminPlayerMerge";
import AdminPlayerSearch from "../AdminPlayerSearch";
//import AdminPlayerHWIDMerge from "../AdminPlayerHWIDMerge";
import AdminPlayerWinRateRecalculation from "../AdminPlayerWinRateRecalculation";
import Tabs from "../Tabs";
import AdminPlayerNameHWID from "../AdminPlayerNameHWID";

class AdminPlayersManager extends React.Component{

    constructor(props){

        super(props);
        this.state = {
            "mode": 7, 
            "players": [], 
            "names": [],
            "bFinishedLoadingGeneral": false, 
            "general": null, 
            "generalError": null
        };

        this.changeMode = this.changeMode.bind(this);
    }

    changeMode(id){
        this.setState({"mode": id});
    }

    async loadGeneral(){

        try{

            this.setState({"generalError": null, "bFinishedLoadingGeneral": false});

            const req = await fetch("/api/adminplayers", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "general"})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({"bFinishedLoadingGeneral": true, "general": res});
            }


        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        //await this.loadNames();
        await this.loadGeneral();
    }

    renderGeneral(){

        if(this.state.mode !== 0) return null;

        let elems = null;

        if(this.state.bFinishedLoadingGeneral ){

            elems = <div>
                <BasicUIBox title="IP addresses" value={this.state.general.uniqueIps} image={`/images/bar-chart.png`} />
                <BasicUIBox title="Total Players" value={this.state.general.totalPlayers.allTime} image={`/images/bar-chart.png`} />
                <BasicUIBox title="Players Last 24 Hours" value={this.state.general.totalPlayers.past24Hours} image={`/images/bar-chart.png`} />
                <BasicUIBox title="Players Last 7 Days" value={this.state.general.totalPlayers.pastWeek} image={`/images/bar-chart.png`} />
                <BasicUIBox title="Players Last 28 Days" value={this.state.general.totalPlayers.pastMonth} image={`/images/bar-chart.png`} />
            </div>
        }else{

            elems = <Loading />;
        }

        return <div>
            <div className="default-header">General Summary</div>
            {elems}
        </div>
    }

    renderRename(){

        if(this.state.mode !== 2) return null;

        return <AdminPlayerRename />;
    }

    renderDelete(){

        if(this.state.mode !== 4) return null;

        return <AdminDeletePlayer />;
    }

    renderMerge(){

        if(this.state.mode !== 3) return null;

        return <AdminPlayerMerge />;
    }

    renderSearch(){

        if(this.state.mode !== 1) return null;

        return <AdminPlayerSearch />;
    }

    renderHWIDMerge(){

        return null;
        /*
        if(this.state.mode !== 5) return null;

        return <AdminPlayerHWIDMerge />;*/
    }

    renderWinrate(){

        if(this.state.mode !== 6) return null;

        return <AdminPlayerWinRateRecalculation />;
    }

    renderHWIDToName(){

        if(this.state.mode !== 7) return null;

        return <AdminPlayerNameHWID />;
    }

    render(){

        return <div>
            <div className="default-header">Player Manager</div>
            <Tabs options={[
                {"name": "General Summary", "value": 0},
                {"name": "Search", "value": 1},
                {"name": "Rename Player", "value": 2},
                {"name": "Merge Players", "value": 3},
                {"name": "Delete Player", "value": 4},
                {"name": "Recalculate Win Rates", "value": 6},
                {"name": "HWID to Name Override", "value": 7},
            ]} selectedValue={this.state.mode} changeSelected={(id) =>{
                this.setState({"mode": id});
            }}/>
            {this.renderGeneral()}
            {this.renderSearch()}
            {this.renderRename()}
            {this.renderMerge()}
            {this.renderDelete()}
            {this.renderWinrate()}
            {this.renderHWIDToName()}
        </div>
    }
}

export default AdminPlayersManager;