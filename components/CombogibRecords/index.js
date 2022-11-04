import React from "react";
import Loading from "../Loading";
import Option2Alt from "../Option2Alt";
import ErrorMessage from "../ErrorMessage";
import Link from "next/link";


class CombogibRecords extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "loaded": false, "error": null, "validTypes": null,
            "perPage": this.props.perPage, "recordType": this.props.type
        };

        this.changePerPage = this.changePerPage.bind(this);
        this.changeRecordType = this.changeRecordType.bind(this);
    }

    changePerPage(e){

        this.setState({"perPage": e.target.value});
    }

    changeRecordType(e){

        this.setState({"recordType": e.target.value});
    }



    async componentDidUpdate(prevProps){
     
    
    }

    renderOptions(){


        if(this.props.validTypes === null) return null;

        const options = [];

        const data = (this.props.mode === 0) ? [...this.props.validTypes.match] : [...this.props.validTypes.totals];


        data.sort((a, b) =>{

            a = a.display.toLowerCase();
            b = b.display.toLowerCase();

            if(a < b) return -1;
            if(a > b) return 1;
            return 0;
        });


        for(let i = 0; i < data.length; i++){

            const {name, display} = data[i];
            options.push(<option key={name} value={name}>{display}</option>);
        }
 

        return <select className="default-select" value={this.state.recordType} onChange={this.changeRecordType}>
            {options}
        </select>
    }

    render(){

        return <div>
            <div className="default-sub-header">Select Record Type</div>
            <div className="form">
                <div className="select-row">
                    <div className="select-label">Record Mode</div>
                    <Option2Alt 
                        url1={`/records/?mode=3&cm=0&type=${this.state.recordType}&page=1&pp=${this.state.perPage}`} title1="Single Match" 
                        url2={`/records/?mode=3&cm=1&type=${this.state.recordType}&page=1&pp=${this.state.perPage}`} title2="Player Totals" 
                        value={this.props.mode}
                    />
                </div>
                <div className="select-row">
                    <div className="select-label">Record Type</div>
                    {this.renderOptions()}
                </div>
                <div className="select-row">
                    <div className="select-label">Results Per Page</div>
                    <select value={this.state.perPage} onChange={this.changePerPage} className="default-select">
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="75">75</option>
                        <option value="100">100</option>
                    </select>
                </div>
                <Link href={`/records/?mode=3&cm=${this.props.mode}&type=${this.state.recordType}&page=1&pp=${this.state.perPage}`}>
                    <a>
                        <div className="search-button">Search</div>
                    </a>
                </Link>
            </div>
            <Loading value={this.state.loaded}/>
            <ErrorMessage title="CombogibRecords" text={this.state.error}/>
        </div>
    }
}

export default CombogibRecords;