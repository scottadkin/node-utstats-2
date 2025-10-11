"use client"
import { useState } from "react"
import { getMultiTitles, convertMultis, ignore0, getSpreeTitles, convertSprees } from "../../../../api/generic.mjs";
import InteractiveTable from "../InteractiveTable";
import Tabs from "../Tabs";


function renderMultis(mode, cat, data){

    const titles = getMultiTitles(mode);

    const headers = {"name": "Name"};

    for(let i = 0; i < titles.length; i++){
        headers[titles[i]] = titles[i];
    }

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(cat === 0 && (d.gametype !== 0 || d.map !== 0)) continue;
        if(cat === 1 && (d.gametype === 0 || d.map > 0)) continue;
        if(cat === 2 && (d.map === 0 || d.gametype > 0)) continue;
        

        let name = "";

        if(cat === 0) name = "All";
        if(cat === 1) name = d.gametypeName;
        if(cat === 2) name = d.mapName;

        const row = {
            "name": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"}
        };

        const multis = convertMultis(mode, d);

        for(let x = 0; x < multis.length; x++){
            const m = multis[x];
            const t = titles[x];
            row[t] = {"value": m, "displayValue": ignore0(m)};
        }
   
        rows.push(row);
    }

    return <>
        <InteractiveTable width={1} headers={headers} data={rows} defaultOrder={"name"}/>
    </>
}

function renderSprees(mode, cat, data){

    const titles = getSpreeTitles(mode);

    const headers = {"name": "Name"};

    for(let i = 0; i < titles.length; i++){
        headers[titles[i]] = titles[i];
    }

    const rows = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(cat === 0 && (d.gametype !== 0 || d.map !== 0)) continue;
        if(cat === 1 && (d.gametype === 0 || d.map > 0)) continue;
        if(cat === 2 && (d.map === 0 || d.gametype > 0)) continue;
        

        let name = "";

        if(cat === 0) name = "All";
        if(cat === 1) name = d.gametypeName;
        if(cat === 2) name = d.mapName;

        const row = {
            "name": {"value": name.toLowerCase(), "displayValue": name, "className": "text-left"}
        };

        const multis = convertSprees(mode, d);

        for(let x = 0; x < multis.length; x++){
            const m = multis[x];
            const t = titles[x];
            row[t] = {"value": m, "displayValue": ignore0(m)};
        }
   
        rows.push(row);
    }

    return <>
        <InteractiveTable width={1} headers={headers} data={rows} defaultOrder={"name"}/>
    </>
}

export default function PlayerSpecialEvents({data}){

    const [mode, setMode] = useState("ut99");
    const [cat, setCat] = useState(0);

    const modeTabOptions = [
        {"name": "Classic", "value": "ut99"},
        {"name": "Smart CTF", "value": "smartCTF"},
        {"name": "UT2K4", "value": "ut2k4"},
        {"name": "UT3", "value": "ut3"}
    ];

    const catTabOptions = [
        {"name": "Combined", "value": 0},
        {"name": "Gametype Totals", "value": 1},
        {"name": "Map Totals", "value": 2},
    ];

    return <>
        <div className="default-header">Special Events</div>
        <Tabs options={modeTabOptions} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        <Tabs options={catTabOptions} selectedValue={cat} changeSelected={(a) => setCat(() => a)}/>
        {renderMultis(mode, cat, data)}
        {renderSprees(mode, cat, data)}
    </>
}
/*
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
            cols.push(<td key={i}>{Functions.ignore0(data[i])}</td>);
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

        return <Table2 width={1}>
            <tr>
                {headers}
            </tr>
            <tr>
                {cols}
            </tr>
        </Table2>
    }


    createUTSprees(headers, cols, titles, data){

        for(let i = 0; i < titles.length; i++){

            headers.push(<th key={i}>{titles[i]}</th>);
            cols.push(<td key={i}>{Functions.ignore0(data[i])}</td>);
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

        return <Table2 width={1}>
            <tr>
                {headers}
            </tr>
            <tr>
                {cols}
            </tr>
        </Table2>
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

export default PlayerSpecialEvents;*/