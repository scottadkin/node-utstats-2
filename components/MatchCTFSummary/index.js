import MatchCTFSummaryDefault from '../MatchCTFSummaryDefault/';
import MatchCTFSummaryCovers from '../MatchCTFSummaryCovers/';
import React from 'react';


class MatchCTFSummary extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 1};
    }

    renderDefault(){

        if(this.state.mode !== 0) return null;

        return <MatchCTFSummaryDefault playerData={this.props.playerData}/>;
    }

    renderCovers(){

        if(this.state.mode !== 1) return null;
        return <MatchCTFSummaryCovers playerData={this.props.playerData}/>;
    }

    render(){

        return <div>
            <div className="default-header">Capture The Flag Summary</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`}>General</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`}>Covers</div>
            </div>
            {this.renderDefault()}
            {this.renderCovers()}
        </div>
    }
}

export default MatchCTFSummary;