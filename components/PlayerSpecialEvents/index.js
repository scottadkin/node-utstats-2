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


    createUTMultis(headers, cols, titles, data){


        for(let i = 0; i < titles.length; i++){

            headers.push(<th>{titles[i]}</th>);
            cols.push(<td>{data[i]}</td>);
        }


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

        if(this.state.mode === 0){

            const titles = [
                "Double Kill",
                "Multi Kill",
                "Ultra Kill",
                "Monster Kill"
            ];

            const data = [
                this.props.data.multi_1,
                this.props.data.multi_2,
                this.props.data.multi_3,
                this.props.data.multi_4 + this.props.data.multi_5 + this.props.data.multi_6 + this.props.data.multi_7
            ];

            this.createUTMultis(headers, cols, titles, data);

        }else if(this.state.mode === 1){

            const titles = [
                "Double Kill",
                "Tripple Kill",
                "Multi Kill",
                "Mega Kill",
                "Ultra Kill",
                "Monster Kill"
            ];

            const data = [
                this.props.data.multi_1,
                this.props.data.multi_2,
                this.props.data.multi_3,
                this.props.data.multi_4,
                this.props.data.multi_5,
                this.props.data.multi_6 + this.props.data.multi_7
            ];

            this.createUTMultis(headers, cols, titles, data);

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

            const data = [];

            for(let i = 0; i < 7; i++){

                data.push(this.props.data[`multi_${i+1}`]);
            }

            this.createUTMultis(headers, cols, titles, data);

        }else if(this.state.mode === 3){

            const titles = [
                "Double Kill",
                "Multi Kill",
                "Mega Kill",
                "Ultra Kill",
                "Monster Kill"
            ];

            const data = [
                this.props.data.multi_1,
                this.props.data.multi_2,
                this.props.data.multi_3,
                this.props.data.multi_4,
                this.props.data.multi_5 +this.props.data.multi_6 +this.props.data.multi_7
            ];
            

            this.createUTMultis(headers, cols, titles, data);

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