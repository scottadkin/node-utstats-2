import React from 'react';
import Functions from '../../api/functions';

class PlayerSpecialEvents extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0};

        this.changeMode = this.changeMode.bind(this);
    }

    componentDidMount(){

        const settings = this.props.session;

        if(settings["playerPageSpecialMode"] !== undefined){
            this.setState({"mode": parseInt(settings["playerPageSpecialMode"])});
        }
    }

    changeMode(id){

        this.setState({"mode": id});
        Functions.setCookie("playerPageSpecialMode", id);
    }


    createUTMultis(headers, cols, titles, data){


        for(let i = 0; i < titles.length; i++){

            headers.push(<th key={i}>{titles[i]}</th>);
            cols.push(<td key={i}>{data[i]}</td>);
        }


    }

    createMultis(){

        const cols = [];
        const headers = [];

        let titles = [];
        let data = [];

        headers.push(<th key={"fb"}>
            First Bloods
        </th>);

        cols.push(<td key={"fb"}>
            {this.props.data.first_bloods}
        </td>);

        if(this.state.mode === 0){

            titles = [
                "Double Kill",
                "Multi Kill",
                "Ultra Kill",
                "Monster Kill"
            ];

            data = [
                this.props.data.multi_1,
                this.props.data.multi_2,
                this.props.data.multi_3,
                this.props.data.multi_4 + this.props.data.multi_5 + this.props.data.multi_6 + this.props.data.multi_7
            ];


        }else if(this.state.mode === 1){

            titles = [
                "Double Kill",
                "Tripple Kill",
                "Multi Kill",
                "Mega Kill",
                "Ultra Kill",
                "Monster Kill"
            ];

            data = [
                this.props.data.multi_1,
                this.props.data.multi_2,
                this.props.data.multi_3,
                this.props.data.multi_4,
                this.props.data.multi_5,
                this.props.data.multi_6 + this.props.data.multi_7
            ];

        }else if(this.state.mode === 2){

            titles = [
                "Double Kill",
                "Multi Kill",
                "Mega Kill",
                "Ultra Kill",
                "Monster Kill",
                "Ludicrous Kill",
                "Holy Shit",
            ];

            for(let i = 0; i < 7; i++){

                data.push(this.props.data[`multi_${i+1}`]);
            }

        }else if(this.state.mode === 3){

            titles = [
                "Double Kill",
                "Multi Kill",
                "Mega Kill",
                "Ultra Kill",
                "Monster Kill"
            ];

            data = [
                this.props.data.multi_1,
                this.props.data.multi_2,
                this.props.data.multi_3,
                this.props.data.multi_4,
                this.props.data.multi_5 +this.props.data.multi_6 +this.props.data.multi_7
            ];
        
        }

        this.createUTMultis(headers, cols, titles, data);


        headers.push(<th key="b">Best Multi</th>);
        cols.push(<td key="b">{this.props.data.multi_best} Kills</td>);

        return <table className="t-width-1 m-bottom-10">
            <tbody>
                <tr>
                    {headers}
                </tr>
                <tr>
                    {cols}
                </tr>
            </tbody>
        </table>
    }


    createUTSprees(headers, cols, titles, data){

        for(let i = 0; i < titles.length; i++){

            headers.push(<th key={i}>{titles[i]}</th>);
            cols.push(<td key={i}>{data[i]}</td>);
        }
    }

    createSprees(){

        const headers = [];
        const cols = [];

        let titles = [];
        let data = [];

        if(this.state.mode === 0){

            titles = ["Killing Spree", "Rampage", "Dominating", "Unstoppable", "Godlike"];

            data = [
                this.props.data.spree_1,
                this.props.data.spree_2,
                this.props.data.spree_3,
                this.props.data.spree_4,
                this.props.data.spree_5 + this.props.data.spree_6 + this.props.data.spree_7
            ];

            

        }else if(this.state.mode === 1){

            titles = ["Killing Spree", "Rampage", "Dominating", "Unstoppable", "Godlike", "Too Easy", "Brutalizing"];

            data = [
                this.props.data.spree_1,
                this.props.data.spree_2,
                this.props.data.spree_3,
                this.props.data.spree_4,
                this.props.data.spree_5,
                this.props.data.spree_6,
                this.props.data.spree_7
            ];

        }else if(this.state.mode === 2){

            titles = ["Killing Spree", "Rampage", "Dominating", "Unstoppable", "Godlike", "Whicked Sick"];

            data = [
                this.props.data.spree_1,
                this.props.data.spree_2,
                this.props.data.spree_3,
                this.props.data.spree_4,
                this.props.data.spree_5,
                this.props.data.spree_6 + this.props.data.spree_7
            ];

        }else if(this.state.mode === 3){

            titles = ["Killing Spree", "Rampage", "Dominating", "Unstoppable", "Godlike", "Massacre"];

            data = [
                this.props.data.spree_1,
                this.props.data.spree_2,
                this.props.data.spree_3,
                this.props.data.spree_4,
                this.props.data.spree_5,
                this.props.data.spree_6 + this.props.data.spree_7
            ];
        }

        this.createUTSprees(headers, cols, titles, data);

        headers.push(<th key="end">Best Spree</th>);
        cols.push(<td key="end">{this.props.data.spree_best} Kills</td>);

        return <table className="t-width-1">
            <tbody>
                <tr>
                    {headers}
                </tr>
                <tr>
                    {cols}
                </tr>
            </tbody>
        </table>
    }

    render(){

        return <div className="special-table">
            <div className="default-header">Special Events</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>Default</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);
                })}>SmartCTF/DM</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(2);
                })}>UT2K4</div>
                <div className={`tab ${(this.state.mode === 3) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(3);
                })}>UT3</div>
            </div>
            {this.createMultis()}
            {this.createSprees()}
        </div>
    }
}

export default PlayerSpecialEvents;