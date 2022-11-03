import React from "react";
import Loading from "../Loading";
import Option2Alt from "../Option2Alt";


class CombogibRecords extends React.Component{

    constructor(props){

        super(props);

        this.state = {"loaded": false};
    }

    componentDidMount(){

     
    }


    render(){

        return <div>
            <div className="default-sub-header">Combogib Records</div>
            <div className="form">
                <div className="select-row">
                    <div className="select-label">Record Mode</div>
                    <Option2Alt url1={`/records/?mode=3&cm=0`} title1="Single Match" url2={`/records/?mode=3&cm=1`} title2="Player Totals" value={this.props.mode}/>
                </div>
            </div>
            <Loading value={this.state.loaded}/>
        </div>
    }
}

export default CombogibRecords;