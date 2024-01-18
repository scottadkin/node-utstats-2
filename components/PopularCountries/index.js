import Functions from '../../api/functions';
import styles from './PopularCountries.module.css';
import Image from 'next/image';
import {useEffect, useReducer} from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractiveTable from "../InteractiveTable";
import CountryFlag from '../CountryFlag';
import Link from 'next/link';


const reducer = (state, action) =>{

    switch(action.type){

        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "error": null,
                "data": action.data
            }
        }
        case "error": {
            return {
                ...state,
                "bLoading": false,
                "error": action.errorMessage
            }
        }
    }

    return state;
}

const loadData = async (dispatch, signal, countryLimit) =>{

    try{

        const req = await fetch("/api/home",{
            "signal": signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "popular-countries", "limit": countryLimit})
        });

        const res = await req.json();

        if(res.error !== undefined){
            dispatch({"type": "error", "errorMessage": res.error});
            return;
        }

        dispatch({"type": "loaded", "data": res.data});

    }catch(err){

        if(err.name !== "AbortError"){
            console.trace(err);
        }
    }
}

const renderTable = (state, totalPlayers) =>{

    const headers = {
        "name": "Country",
        "first": "First Seen",
        "last": "Last Seen",
        "count": "Players",
        "percent": "Percent of Total Players"
    };

    const data = state.data.map((info) =>{

        let percent = 0;

        if(totalPlayers > 0 && info.total_uses > 0){
            percent = (info.total_uses / totalPlayers) * 100;
        }

        return {
            "name": {
                "value": info.countryName.toLowerCase(), 
                "displayValue": <><CountryFlag country={info.country}/>{info.countryName}</>, 
                "className": "text-left"
            },
            "first": {
                "value": info.first_match,
                "displayValue": Functions.convertTimestamp(info.first_match, true),
                "className": "playtime"
            },
            "last": {
                "value": info.last_match,
                "displayValue": Functions.convertTimestamp(info.last_match, true),
                "className": "playtime"
            },
            "count": {
                "value": info.total_uses
            },
            "percent": {
                "value": percent,
                "displayValue": <>{percent.toFixed(2)}%</>,
            }
        }
    });

    return <InteractiveTable key="basic-table" headers={headers} data={data} width={1}/>
}

const renderDefault = (state, totalPlayers) =>{

    const elems = state.data.map((d, i) =>{

        let percent = 0;

        if(totalPlayers > 0){
            percent = (d.total_uses / totalPlayers) * 100;
        }
        
        return <Link key={d.country} href={`/players?country=${d.country.toLowerCase()}`}>
            <div key={i} className={styles.country}>
                <div className={styles.name}>{d.countryName}</div>
                <div><Image src={`/images/flags/${d.country.toLowerCase()}.svg`} alt={d.country} width={190} height={100}/></div>
                <div className={styles.info}>
                    {d.total_uses} Players<br/>
                    {percent.toFixed(2)}% of all Players<br/>
                </div>
            </div>
        </Link>
    });


    return <div key="default" className="t-width-1 center">{elems}</div>;
}

const PopularCountries = ({totalPlayers, settings}) =>{

    const [state, dispatch] = useReducer(reducer, {"bLoading": true, "error": null, "data": []});

    useEffect(() =>{

        const controller = new AbortController();

        loadData(dispatch, controller.signal, settings["Popular Countries Display Limit"]);

        return () =>{
            controller.abort();
        }
    }, [settings]);

    const elems = [];

    if(state.bLoading) elems.push(<Loading key="loading"/>);
    if(state.error !== null) return <ErrorMessage key="error" title="Popular Countries" text={state.error}/>

    if(!state.bLoading && settings["Popular Countries Display Type"] === "1") elems.push(renderTable(state, totalPlayers));
    if(!state.bLoading && settings["Popular Countries Display Type"] === "0") elems.push(renderDefault(state, totalPlayers));

    return <div>
        <div className="default-header">Popular Countries</div>
        {elems}
    </div>
}

export default PopularCountries;