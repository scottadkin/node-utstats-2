import React from 'react';

class PlayerSpecialEvents extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0};

        this.changeMode = this.changeMode.bind(this);
    }

    changeMode(id){

        this.setState({"mode": id});
    }

    createMultis(){

        const cols = [];
        const headers = [];

        headers.push(<th key={"fb"}>
            First Bloods
        </th>);

        cols.push(<td key={"fb"}>
            {this.props.data.first_bloods}
        </td>);

        let mergedEvents = 0;

        if(this.state.mode === 0){

            const titles = [
                "Double Kill",
                "Multi Kill",
                "Ultra Kill",
                "Monster Kill"
            ];

            for(let i = 0; i < 4; i++){

                headers.push(<th key={i}>{titles[i]}</th>);

                if(i < 3){
                    cols.push(<td key={i}>
                        {this.props.data[`multi_${i+1}`]}
                    </td>);
                }else{

                    for(let x = 4; x <= 7; x++){
                        mergedEvents += this.props.data[`multi_${x}`];
                    }
                    cols.push(<td key={i}>
                        {mergedEvents}
                    </td>);
                }
            }

        }else if(this.state.mode === 1){

            const titles = [
                "Double Kill",
                "Tripple Kill",
                "Multi Kill",
                "Mega Kill",
                "Ultra Kill",
                "Monster Kill"
            ];

            for(let i = 0; i < titles.length; i++){

                headers.push(<th key={i}>
                    {titles[i]}
                </th>);
            }

            cols.push(<td key={1}>{this.props.data.multi_1}</td>);
            cols.push(<td key={2}>{this.props.data.multi_2}</td>);
            cols.push(<td key={3}>{this.props.data.multi_3}</td>);
            cols.push(<td key={4}>{this.props.data.multi_4}</td>);
            cols.push(<td key={5}>{this.props.data.multi_5}</td>);
            cols.push(<td key={6}>{this.props.data.multi_6 + this.props.data.multi_7}</td>);

        }else if(this.state.mode === 2){

            const titles = [
                "Double Kill",
                "Multi Kill",
                "Mega Kill",
                "Ultra Kill",
                "Monster Kill",
                "Ludicrous Kill",
                "Holy Shit",
            ];

            for(let i = 0; i < 7; i++){

                headers.push(<th key={i}>{titles[i]}</th>);
                cols.push(<td key={i}>{this.props.data[`multi_${i+1}`]}</td>);
            }

        }else if(this.state.mode === 3){

            const titles = [
                "Double Kill",
                "Multi Kill",
                "Mega Kill",
                "Ultra Kill",
                "Monster Kill"
            ];

            for(let i = 0; i < titles.length; i++){

                headers.push(<th key={i}>{titles[i]}</th>);

                if(i < 4){
                    cols.push(<td key={i}>{this.props.data[`multi_${i+1}`]}</td>);
                }else{

                    for(let x = 5; x <= 7; x++){
                        mergedEvents += this.props.data[`multi_${x}`];
                    }

                    cols.push(<td key={i}>{mergedEvents}</td>);
                }
            }

        }

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
        </div>
    }
}

export default PlayerSpecialEvents;