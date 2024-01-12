import React, { useEffect, useReducer, useRef } from "react";
import styles from "./DropDown.module.css";
import ErrorMessage from "../ErrorMessage";
import useScreenInfo from "../../hooks/useScreenInfo";

const reducer = (state, action) =>{


    switch(action.type){

        case "set-active": {
            return {
                ...state,
                "bActive": action.value
            }
        }
        case "set-selected": {
            return {
                ...state,
                "selectedValue": action.value
            }
        }
    }
    return state;
}

const renderEntries = (state, dispatch, data, changeSelected, fName, dRef) =>{

    const elems = [];

    for(let i = 0; i < data.length; i++){

        const {value, displayValue} = data[i];

        if(!state.bActive){

            if(state.selectedValue === null){

                elems.push(<div className={styles.fake} key={"null"}>Please select value</div>);
                break;

            }else{           
                if(value === state.selectedValue){
                    elems.push(<div className={styles.fake} key={`${i}-${value}`}>{displayValue}</div>);
                    break;
                }
            }

        }else{

            let className = `${styles.entry}`;

            if(value === state.selectedValue){
                className += ` ${styles.selected}`;
            }

            elems.push(<div className={className} key={`${i}-${value}`} onMouseDown={(() =>{
         
                dispatch({"type": "set-selected", "value": value});
                dispatch({"type": "set-active", "value": false});
                changeSelected(fName, value);
              
          
            })}>{displayValue}</div>);
        }
    }

    //just incase there is a value that is not in the dataset
    if(elems.length === 0){

        if(data.length > 0){

            const option = data[0];

            elems.push(<div className={styles.fake} key={option.value} onMouseDown={(() =>{
                //changeSelected(data.value);
                //dispatch({"type": "set-selected", "value": option.value});
                dispatch({"type": "set-active", "value": false});
                changeSelected(fName, option.value);
            })}>{option.displayValue}</div>);

        }
    }
    
    const zStyle = (state.bActive) ? {"position":"relative", "width": "100%", "border": "1px solid var(--border-color-3)"} : { "overflow": "hidden"};



    return <div className={styles.entries} ref={dRef}
        onMouseLeave={() =>{
            dispatch({"type": "set-active", "value": false});
        }} 
        style={zStyle}>
        {elems}
    </div>
}

const fixHeight = (dRef, screenHeight) =>{

    if(dRef.current === null || screenHeight === 0) return;

    const bounds = dRef.current.getBoundingClientRect();

    if(bounds.bottom> screenHeight){

        const overlap = bounds.bottom - screenHeight;
        dRef.current.style.maxHeight = `${bounds.height - overlap}px`;
    }else{
        dRef.current.style.maxHeight = `30vh`;
    }
}

const DropDown = ({data, dName, fName, selectedValue, changeActive, changeSelected, originalValue, bForceSmall}) =>{
    
    const [state, dispatch] = useReducer(reducer, {
        "bActive": false,
        "selectedValue": (selectedValue !== undefined) ? selectedValue : (originalValue !== null) ? originalValue : null,

    });
    

    const dRef = useRef(null);

    const screenInfo = useScreenInfo();

    useEffect(() =>{
        fixHeight(dRef, screenInfo.height);
        
    },[]);


    useEffect(() =>{

        fixHeight(dRef, screenInfo.height);

    },[state.bActive]);

    if(data === undefined ){
        return <ErrorMessage title={`DropDown (${this.props.dName})`} text="No data supplied."/>
    }

    if(data === null){
        return <ErrorMessage title={`DropDown (${this.props.dName})`} text="Data is null."/>
    }


    const style = {};

    if(bForceSmall !== undefined){

        style.width = "var(--textbox-width-1)";
        style.maxWidth = "var(--textbox-max-width-1)";
    }


    return <div className={styles.wrapper}>  
        <div className={styles.label}>
            {dName} 
        </div>
        <div className={styles.dd} style={style} onMouseDown={() => {
            if(state.bActive) return;
            dispatch({"type": "set-active", "value": true})}
        }>
            {renderEntries(state, dispatch, data, changeSelected, fName, dRef, screenInfo.height)}
        </div>
    </div>
}

export default DropDown;