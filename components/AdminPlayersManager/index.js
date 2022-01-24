import React from 'react';
import Loading from '../Loading';
import AdminPlayerRename from '../AdminPlayerRename';

import BasicUIBox from '../BasicUIBox';

class AdminPlayersManager extends React.Component{

    constructor(props){

        super(props);
        this.state = {
            "mode": 2, 
            "names": [], 
            "bFinishedLoadingNames": false, 
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

    async loadNames(){

        try{

            const req = await fetch("/api/adminplayers", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "allnames"})
            });

            const res = await req.json();

            if(res.error === undefined){
                this.setState({"bFinishedLoadingNames": true, "names": res.names});
            }

            console.log(res);

        }catch(err){
            console.trace(err);
        }   
    }

    async componentDidMount(){

        await this.loadNames();
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

        if(!this.state.bFinishedLoadingNames){

            return <Loading />;
        }

        return <AdminPlayerRename players={this.state.names}/>;
    }

    render(){

        return <div>
            <div className="default-header">Player Manager</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);  
                })}>General Summary</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);  
                })}>Search</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(2);  
                })}>Rename Player</div>
                <div className={`tab ${(this.state.mode === 3) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(3);  
                })}>Merge Players</div>
                <div className={`tab ${(this.state.mode === 4) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(4);  
                })}>Delete Player</div>
            </div>
            {this.renderGeneral()}

            {this.renderRename()}
        </div>
    }
}

export default AdminPlayersManager;