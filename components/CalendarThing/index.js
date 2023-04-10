import { useReducer, useEffect } from "react";
import styles from "./CalendarThing.module.css";
import Functions from "../../api/functions";

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
                "bLoading": false,
            }
        }
        case "set-data": {
            
            const monthData = state.data;

            if(monthData[action.yearIndex] === undefined){
                monthData[action.yearIndex] = {};
            }

            monthData[action.yearIndex][action.monthIndex] = action.data;

            return {
                ...state,
                "monthData": monthData
            }
        }
    }

    return state;
}

const loadData = async (data, dispatch, signal, start, end, yearIndex, monthIndex) =>{

    if(data[yearIndex] !== undefined){
        if(data[yearIndex][monthIndex] !== undefined){
            console.log(`data already exists`);
            return;
        }
    }

    const req = await fetch("/api/home", {
        "signal": signal,
        "headers": {"Content-type": "application/json"},
        "method": "POST",
        "body": JSON.stringify({"mode": "match-count", "start": start, "end": end})
    });

    const res = await req.json();

    if(res.error !== undefined){

        return;
    }

    dispatch({"type": "set-data", "yearIndex": yearIndex, "monthIndex": monthIndex, "data": res.data});
}

const getData = (state) =>{

    const date = new Date(state.year, state.month);

    const year = date.getFullYear();
    const month = date.getMonth();

    if(state.data[year] !== undefined){

        if(state.data[year][month] !== undefined){

            return state.data[year][month];
        }
    }

    return null;
}

const renderHeatMap = (state, year, month, currentMonth) =>{

    const elems = [];

    const now = new Date();
    const currentDate = now.getDate();
    const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();

    const data = getData(state);

    let max = 0;

    if(data !== null){
        max = Math.max(...Object.values(data));
    }

    let colorPercent = (max > 0) ? 255 / max : 0;

    for(let i = 0; i < daysInMonth; i++){

        if(data === null) break;

        let className = styles.day;

        if(year === currentMonth.getFullYear() && month === currentMonth.getMonth() && i + 1 === currentDate){
            className += ` ${styles.today}`;
        }

        elems.push(<div className={className} key={i} style={{"backgroundColor": `rgb(${data[i] * colorPercent},0,0)`}}>
            {i + 1}
        </div>);
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
        "data": {}
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
    

    return <div className={styles.wrapper}>
        
        <br/>
        <div className={styles.date}>
            {Functions.getMonthName(currentMonth.getMonth(), true)} {currentMonth.getFullYear()}
        </div>
        <div className={styles.button} onClick={() => {dispatch({"type": "previousMonth"})}}>
            Previous Month
        </div>
        <div className={styles.button} onClick={() => {dispatch({"type": "nextMonth"})}}>
            Next Month
        </div>
        {renderHeatMap(state, year, month, currentMonth)}
        
    </div>
}

export default CalendarThing;