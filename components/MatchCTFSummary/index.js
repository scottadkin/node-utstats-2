import MatchCTFSummaryDefault from '../MatchCTFSummaryDefault/';
import MatchCTFSummaryCovers from '../MatchCTFSummaryCovers/';
import React from 'react';
import Functions from '../../api/functions';


class MatchCTFSummary extends React.Component{

    constructor(props){

        super(props);

        this.state = {"bLoading": true, "error": null};
    }



    render(){


        return <div>
            <div className="default-header">Capture The Flag Summary</div>
          
        </div>
    }
}

export default MatchCTFSummary;