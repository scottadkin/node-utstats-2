import React from "react";
import Option2 from "../Option2";

class CTFCapRecords extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0};

        this.changeMode = this.changeMode.bind(this);
    }

    changeMode(id){

        this.setState({"mode": id});
    }

    render(){

        return <div>
            <div className="default-sub-header">Select Record Type</div>
            <div className="form">
                <div className="select-row">
                    <div className="select-label">
                        Capture Type
                    </div>
                    <Option2 title1="Solo Caps" title2="Assisted Cap" value={this.state.mode} changeEvent={this.changeMode}/>
                </div>
            </div>
        </div>
    }
}

export default CTFCapRecords;