import { useReducer, useEffect } from "react";
import styles from "./CalendarThing.module.css";
import Functions from "../../api/functions";
import HeatMapBlock from "../HeatMapBlock";
import Loading from "../Loading";

const reducer = (state, action) =>{

    switch(action.type){

        case "previousMonth":{
            return {
                ...state,
                "month": state.month - 1
            }
        }
        case "nextMonth":{
            return {
                ...state,
                "month": state.month + 1
            }
        }
        case "loadData": {
            return {
                ...state,
                "bLoading": true,
            }
        }
        
        case "set-data": {
            
            const monthData = state.data;

            if(monthData[action.yearIndex] === undefined){
                monthData[action.yearIndex] = {};
            }
            monthData[action.yearIndex][action.monthIndex] = action.data;

            const playerMonthData = state.playerData;

            if(playerMonthData[action.yearIndex] === undefined){
                playerMonthData[action.yearIndex] = {};
            }

            playerMonthData[action.yearIndex][action.monthIndex] = action.playerData;

            return {
                ...state,
                "monthData": monthData,
                "playerMonthData": playerMonthData,
                "bLoading": false
            }
        }
    }

    return state;
}

const loadData = async (data, dispatch, signal, start, end, yearIndex, monthIndex) =>{

    if(data[yearIndex] !== undefined){
        if(data[yearIndex][monthIndex] !== undefined){
            //console.log(`data already exists`);
            return;
        }
    }

    dispatch({"type": "loadData"});

    try{

        const req = await fetch("/api/home", {
            "signal": signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "match-player-count", "start": start, "end": end})
        });

        const res = await req.json();

        if(res.error !== undefined) return;
        

        dispatch({
            "type": "set-data", 
            "yearIndex": yearIndex, 
            "monthIndex": monthIndex, 
            "data": res.data,
            "playerData": res.playerData
        });

    }catch(err){

        if(err.name !== "AbortError"){
            console.trace(err);
        }
    }


}

const getData = (state, type) =>{

    const date = new Date(state.year, state.month);

    const year = date.getFullYear();
    const month = date.getMonth();

    const data = (type === "matches") ? state.data : state.playerData;

    if(data[year] !== undefined){

        if(data[year][month] !== undefined){

            return data[year][month];
        }
    }

    return null;
}

const renderHeatMap = (state, year, month, currentMonth, type) =>{

    if(state.bLoading) return <div className={`${styles.days} center`}><Loading /></div>;

    const elems = [];

    const now = new Date();
    const currentDate = now.getDate();
    const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();
    
    const monthName = Functions.getMonthName(currentMonth.getMonth(), true);
    const fullYear = currentMonth.getFullYear();

    const data = getData(state, type);

    let max = 0;

    if(data !== null){
        max = Math.max(...Object.values(data));
    }

    for(let i = 0; i < daysInMonth; i++){

        if(data === null) break;

        let bHighlight = false;

        if(year === fullYear && month === currentMonth.getMonth() && i + 1 === currentDate){
            bHighlight = true; 
        }

        const ordinal = Functions.getOrdinal(i + 1);

        const day = new Date(state.year, state.month, i + 1);

        let mText = "";

        if(type === "matches"){
            mText = `${data[i]} match${(data[i] !== 1) ? "es" : ""} played.`
        }else{
            mText = `${data[i]} unique player${(data[i] === 1) ? "" : "s"}`;
        }

        elems.push(
            <HeatMapBlock 
                key={i} 
                bHighlight={bHighlight} 
                value={data[i]} 
                maxValue={max} 
                mTitle={`${Functions.getDayName(day.getDay())} ${i + 1}${ordinal} ${monthName} ${fullYear}`}
                mText={mText}
            >
                {i+1}
            </HeatMapBlock>
        );
    }

    return <div className={`${styles.days} center`}>
        {elems}
    </div>
}

const CalendarThing = () =>{

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const [state, dispatch] = useReducer(reducer, {
        "year": year,
        "month": month,
        "data": {},
        "playerData": {}
    });

    useEffect(() =>{

        const controller = new AbortController();

        const startOfMonth = new Date(state.year, state.month, 1);
        const endOfMonth = new Date(state.year, state.month + 1, 0, 23, 59, 59);

        loadData(
            state.data,
            dispatch, 
            controller.signal, 
            Math.floor(startOfMonth * 0.001), 
            Math.floor(endOfMonth * 0.001), 
            startOfMonth.getFullYear(), 
            startOfMonth.getMonth()
        );

        return () =>{
            controller.abort();
        }

    }, [state.month, state.data, state.year])


    const currentMonth = new Date(state.year, state.month);
    

    return <>
            <div className={styles.wrapper}>
            <div className={styles.date}>
                {Functions.getMonthName(currentMonth.getMonth(), true)} {currentMonth.getFullYear()}
            </div>
            <div className={styles.buttons}>
                <div className={styles.button} onClick={() => {dispatch({"type": "previousMonth"})}}>
                    Previous Month
                </div>
                <div className={styles.button} onClick={() => {dispatch({"type": "nextMonth"})}}>
                    Next Month
                </div>
            </div>
            <div className={styles.title}>Matches Played</div>
            {renderHeatMap(state, year, month, currentMonth, "matches")}
            <div className={styles.title}>Unique Players</div>
            {renderHeatMap(state, year, month, currentMonth, "players")}
        </div>     
    </>
}

export default CalendarThing;