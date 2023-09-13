import {useEffect, useReducer} from "react";
import { notificationsInitial, notificationsReducer } from "../../reducers/notificationsReducer";
import NotificationsCluster from "../NotificationsCluster";
import Loading from "../Loading";
import Tabs from "../Tabs";
import CustomGraph from "../CustomGraph";
import InteractiveTable from "../InteractiveTable";
import { convertTimestamp } from "../../api/generic.mjs";

import AnalyticsGeneral from "../AnalyticsHitsGeneral";
import AnalyticsHitsByCountry from "../AnalyticsHitsByCountry";
import AnalyticsHitsByIp from "../AnalyticsHitsByIp";
import AnalyticsUserAgents from "../AnalyticsUserAgents";
import CountryFlag from "../CountryFlag";


const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "graphData": action.graphData,
                "countriesData": action.countriesData,
                "totalHits": action.totalHits
            }
        }
        case "changeTab": {
            return {
                ...state,
                "selectedTab": action.tab
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

        dispatch({
            "type": "loaded", 
            "graphData": res.graphData,
            "countriesData": res.countriesData,
            "totalHits": res.totalHits
        });

    }catch(err){

        if(err.name === "AbortError") return;
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
    }
}

const renderGeneralGraph = (state) =>{

    if(state.bLoading || state.selectedTab !== 0) return null;

    const labels = [[],[],[],[]];

    for(let i = 0; i < 365; i++){

        if(i < 24) labels[0].push(`${i}-${i+1} Hours Ago`);
        if(i < 7) labels[1].push(`${i}-${i+1} Days Ago`);
        if(i < 28) labels[2].push(`${i}-${i+1} Days Ago`);
        labels[3].push(`${i}-${i+1} Days Ago`);
    }

    return <CustomGraph 
        tabs={[
            {"name": "24 Hours", "title": "Page Views Last 24 Hours"},
            {"name": "7 Days", "title": "Page Views Last 7 Days"},
            {"name": "28 Days", "title": "Page Views Last 28 Days"},
            {"name": "365 Days", "title": "Page Views Last 365 Days"},
        ]}
        labels={labels}
        labelsPrefix={["","","",""]}
        data={state.graphData}
        bEnableAdvanced={false}
    />
}

const renderCountriesTable = (state) =>{

    if(state.bLoading || state.selectedTab !== 1) return null;

    const headers = {
        "country": "Country",
        "first": "First Seen",
        "last": "Last Seen",
        "hits": "Total Hits"
    };
    const data = state.countriesData.map((d) =>{
        return {
            "country": {
                "value": d.country.toLowerCase(), 
                "displayValue": <><CountryFlag country={d.code}/>{d.country}</>
            },
            "first": {"value": d.first, "displayValue": <>{convertTimestamp(d.first, true)}</>},
            "last": {"value": d.last, "displayValue": <>{convertTimestamp(d.last, true)}</>},
            "hits": {"value": d.total},
        }
    });

    return <InteractiveTable width={1} headers={headers} data={data}/>
}

const renderGeneralTable = (state) =>{

    if(state.bLoading || state.selectedTab !== 0) return null;

    const headers = {
        "frame": "Time Range",
        "hits": "Total Page Views"
    };

    const data = [];

    data.push({
        "frame": {"value": "", "displayValue": "Past 1 Hour"},
        "hits": {"value": state.totalHits.hour}
    });

    data.push({
        "frame": {"value": "", "displayValue": "Past 24 Hours"},
        "hits": {"value": state.totalHits.day}
    });

    data.push({
        "frame": {"value": "", "displayValue": "Past 7 Days"},
        "hits": {"value": state.totalHits.week}
    });

    data.push({
        "frame": {"value": "", "displayValue": "Past 28 Days"},
        "hits": {"value": state.totalHits.month}
    });

    data.push({
        "frame": {"value": "", "displayValue": "Past Year"},
        "hits": {"value": state.totalHits.year}
    });

    data.push({
        "frame": {"value": "", "displayValue": "All Time"},
        "hits": {"value": state.totalHits.all}
    });

    return <InteractiveTable width={2} headers={headers} data={data}/>
}

const SiteAnalytics = ({}) =>{

    const [nState, nDispatch] = useReducer(notificationsReducer, notificationsInitial);
    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "graphData": [],
        "countriesData": [],
        "selectedTab": 0,
        "totalHits": {"hour": 0, "day": 0, "week": 0, "month": 0, "year": 0, "all": 0}
    });

    useEffect(() =>{

        const controller = new AbortController();

        loadData(nDispatch, dispatch, controller.signal);

        return () =>{
            controller.abort();
        }

    },[]);

    const tabs = [
        {"name": "General Stats", "value": 0},
        {"name": "Hits By Country", "value": 1},
        {"name": "Hits By IP", "value": 2},
        {"name": "User Agents", "value": 3},
    ];

    return <>
        <div className="default-header">Site Analytics</div>
        <Tabs 
            options={tabs} 
            selectedValue={state.selectedTab} 
            changeSelected={(name, value) => { dispatch({"type": "changeTab", "tab": name})}}
        />
        <NotificationsCluster 
            notifications={nState.notifications}
            hide={(id) => nDispatch({"type": "hide", "id": id})}
            clearAll={() => nDispatch({"type": "clearAll"})}
        />
        <Loading value={!state.bLoading} />
        {renderGeneralTable(state)}
        {renderGeneralGraph(state)}
        {renderCountriesTable(state)}
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