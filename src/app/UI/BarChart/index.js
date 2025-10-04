"use client"
import React from "react";
import styles from './BarChart.module.css';
import { useReducer } from "react";

const colors = [
    "red", 
    "rgb(50,50,200)", 
    "green", 
    "yellow", 
    "orange", 
    "pink", 
    "white", 
    "grey",
    "#7FFFD4",
    "#A52A2A",
    "deeppink",
    "palegreen",
    "orangered",
    "turquoise",
    "peru",
    "gold",
    "brown",
    "dimgrey",
    "forestgreen",
    "indianred",
    "lavenderblush",
    "maroon",
    "olive",
    "orchid"
];

function reducer(state, action){

    switch(action.type){
        case "display-mouse-over": {
            return {
                ...state,
                "mouseTitle": action.mouseTitle, 
                "mouseContent": action.mouseContent, 
                "bDisplayMouse": true, 
                "mousePosition": {...action.mousePosition}
            }
        }
        case "hide-mouse-over": {
            return {
                ...state,
                "bDisplayMouse": false
            }
        }
    }

    return {...state};
}

function setDataRange(initialMinValue, values){

    let minValue = initialMinValue ?? 0;
    let maxValue = null;

    for(let i = 0; i < values.length; i++){

        const v = values[i];

        if(minValue === null || v < minValue){
            minValue = v;
        }

        if(maxValue === null || v > maxValue){
            maxValue = v;
        }
    }

    let quater = maxValue * 0.25;

    const rem = quater % 1;

    if(rem !== 0){

        quater = quater + (1 - rem);
        maxValue = quater * 4;
    }

    let range = maxValue - minValue;

    if(range < 4){
        range = 4;
    }

    return {
        minValue,
        maxValue,
        range
    };
}

function renderBar(id, name, value, range, dispatch){

    const bit = 100 / range;

    const percent = bit * value;


    return <React.Fragment key={id}>
        <div 
        className={`${styles.bar}`} 
        style={{"width": `${percent}%`, "backgroundColor": colors[id]}}>
        </div>
        <div className={`${styles.bar}`} style={{"width": "100%","position": "absolute", "backgroundColor": "transparent", "marginTop":"-13px"}}
            onMouseMove={((e) =>{

                const bounds = e.target.getBoundingClientRect();
                const startX = bounds.x;
                const paddingX = bounds.width * 0.25;

                dispatch({"type": "display-mouse-over",
                    "mouseTitle": name, 
                    "mouseContent": `Value: ${value}`, 
                    "bDisplayMouse": true, 
                    "mousePosition": {"x": e.clientX - startX + paddingX - 110, "y": e.target.offsetTop}
                });
            })}
            onMouseOut={(() =>{
                dispatch({"type": "hide-mouse-over"});
            })}
        ></div>
        
    </React.Fragment>;
}

function renderBars(label, values, names, range, dispatch){


    const bars = [];

    for(let i = 0; i < values.length; i++){
        const v = values[i];
        bars.push(renderBar(i, names[i] ?? "Unknown", v, range, dispatch));
    }

    return <div className={styles.barm}>
        <div className={styles.label}>
            {label}
        </div>
        <div className={styles.bars}>
            {bars}         
        </div>
    </div>;
}

function renderKey(name, id){

    return <div className={styles.key} key={name}>
        <div className={`${styles.color}`} style={{"backgroundColor": colors[id]}}></div>
        <div className={styles.kname}>{name}</div>
    </div>
}

function renderKeys(names){

    const keys = [];

    for(let i = 0; i < names.length; i++){

        const n = names[i];
        keys.push(renderKey(n, i));
    }

    return <div className={styles.keys}>
        {keys}
    </div>
}

function renderMouseOver(state){

    if(!state.bDisplayMouse) return null;

    return <div className={styles.mouse} style={{"marginLeft": state.mousePosition.x, "marginTop": state.mousePosition.y}}>
        <div className={styles.mouset}>{state.mouseTitle}</div>
        <div className={styles.mousec}>{state.mouseContent}</div>
    </div>
}

export default function BarChart({weaponNames, label, values, names, title}){

    const [state, dispatch] = useReducer(reducer,{
        "mouseTitle": "Title", 
        "mouseContent": "content", 
        "bDisplayMouse": false, 
        "mousePosition": {"x": 0, "y": 0}
    });

    const {minValue, maxValue, range} = setDataRange(0, values);

    return <div className={styles.wrapper}>
        {renderMouseOver(state)}
        <div className={styles.title}>
            {title}
        </div>

        {renderBars(label, values, names, range, dispatch)}

        <div className={styles.hl}></div>
        <div className={styles.vls}>
            <div className={styles.vl} style={{"marginLeft": "25%"}}></div>
            <div className={styles.vl} style={{"marginLeft": "41.25%"}}></div>
            <div className={styles.vl} style={{"marginLeft": "57.50%"}}></div>
            <div className={styles.vl} style={{"marginLeft": "73.75%"}}></div>
            <div className={styles.vl} style={{"marginLeft": "90%"}}></div>
        </div>
        <div className={styles.values}>
            <div className={styles.value} style={{"marginLeft": "16.875%"}}>0</div>
            <div className={styles.value} style={{"marginLeft": "33.125%"}}>{range * 0.25}</div>
            <div className={styles.value} style={{"marginLeft": "49.375%"}}>{range * 0.5}</div>
            <div className={styles.value} style={{"marginLeft": "65.625%"}}>{range * 0.75}</div>
            <div className={styles.value} style={{"marginLeft": "81.875%"}}>{range}</div>
        </div>

        {renderKeys(names)} 
    </div>

}
