import {useEffect, useReducer} from "react";
import { notificationsInitial, notificationsReducer } from "../../reducers/notificationsReducer";
import NotificationsCluster from "../NotificationsCluster";
import Loading from "../Loading";
import CustomGraph from "../CustomGraph";

import AnalyticsGeneral from "../AnalyticsHitsGeneral";
import AnalyticsHitsByCountry from "../AnalyticsHitsByCountry";
import AnalyticsHitsByIp from "../AnalyticsHitsByIp";
import AnalyticsUserAgents from "../AnalyticsUserAgents";


const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "graphData": action.graphData
            }
        }
    }
    return state;
}

const loadData = async (nDispatch, dispatch, signal) =>{

    try{

        const req = await fetch("/api/admin", {
            "signal": signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "get-analytics"})
        });

        const res = await req.json();

        if(res.error !== undefined){
            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            return;
        }

        console.log(res);

        dispatch({"type": "loaded", "graphData": res.graphData});

    }catch(err){

        if(err.name === "AbortError") return;
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
    }
}

const testGraph = (state) =>{

    if(state.bLoading) return null;

    return <CustomGraph 
        tabs={[
            {"name": "24 Hours", "title": "Page Views Last 24 Hours"},
            {"name": "7 Days", "title": "Page Views Last 7 Days"},
            {"name": "28 Days", "title": "Page Views Last 28 Days"},
            {"name": "365 Days", "title": "Page Views Last 365 Days"},
        ]}
        labels={[
            [],[],[],[]
        ]}
        labelsPrefix={["","","",""]}
        data={state.graphData}
    />

}

const SiteAnalytics = ({}) =>{

    const [nState, nDispatch] = useReducer(notificationsReducer, notificationsInitial);
    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "graphData": []
    });

    useEffect(() =>{

        const controller = new AbortController();

        nDispatch({"type": "add", "notification": {"type": "error", "content": <b>Test</b>}});

        loadData(nDispatch, dispatch, controller.signal);

        return () =>{
            controller.abort();
        }

    },[]);

    return <>
        <div className="default-header">Site Analytics</div>
        <NotificationsCluster 
            notifications={nState.notifications}
            hide={(id) => nDispatch({"type": "hide", "id": id})}
            clearAll={() => nDispatch({"type": "clearAll"})}
        />
        <Loading value={!state.bLoading} />
        {testGraph(state)}
    </>
}
/*
class SiteAnalytics extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0};

        this.changeMode = this.changeMode.bind(this);
    }

    changeMode(id){

        this.setState({"mode": id});
    }

    renderGeneral(){

        if(this.state.mode !== 0) return null;

        return <AnalyticsGeneral data={this.props.generalHits} visitors={this.props.visitors}/>;
    }

    renderHitsByCountry(){

        if(this.state.mode !== 1) return null;

        return <AnalyticsHitsByCountry data={this.props.countriesByHits}/>;
    }

    renderHitsByIp(){

        if(this.state.mode !== 2) return null;

        return <AnalyticsHitsByIp data={this.props.ipsByHits}/>;
    }

    renderUserAgents(){

        if(this.state.mode !== 3) return null;

        return <AnalyticsUserAgents data={this.props.userAgents}/>
    }

    render(){

        return <div>
            <div className="default-header">Site Analytics</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : null }`} onClick={(() =>{
                    this.changeMode(0);
                })}>General Stats</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : null }`} onClick={(() =>{
                    this.changeMode(1);
                })}>Hits By Countries</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : null }`} onClick={(() =>{
                    this.changeMode(2);
                })}>Hits By IP</div>
                <div className={`tab ${(this.state.mode === 3) ? "tab-selected" : null }`} onClick={(() =>{
                    this.changeMode(3);
                })}>User Agents</div>
            </div>

            {this.renderGeneral()}
            {this.renderHitsByCountry()}
            {this.renderHitsByIp()}
            {this.renderUserAgents()}
        </div>
    }
}*/

export default SiteAnalytics;