import React from 'react';
import AnalyticsGeneral from '../AnalyticsHitsGeneral';
import AnalyticsHitsByCountry from '../AnalyticsHitsByCountry';
import AnalyticsHitsByIp from '../AnalyticsHitsByIp';
import AnalyticsUserAgents from '../AnalyticsUserAgents';

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
}

export default SiteAnalytics;