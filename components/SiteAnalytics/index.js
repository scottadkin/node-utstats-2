import React from 'react';
import AnalyticsHitsByCountry from '../AnalyticsHitsByCountry';

class SiteAnalytics extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0};
    }

    renderHitsByCountry(){

        return <AnalyticsHitsByCountry data={this.props.countriesByHits}/>
    }

    render(){

        return <div>
            <div className="default-header">Site Analytics</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : null }`}>Hits By Countries</div>
            </div>

            {this.renderHitsByCountry()}
        </div>
    }
}

export default SiteAnalytics;