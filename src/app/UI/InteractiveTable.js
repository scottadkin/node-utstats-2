"use client"

import { useReducer } from "react";
import styles from "./InteractiveTable.module.css";

function createHeaders(headers, state, dispatch){

    const elems = [];

    for(const [name, content] of Object.entries(headers)){
        elems.push(<th key={name} onClick={() =>{
            dispatch({"type": "changeSort", "value": name});
        }}>{content.title}</th>);
    }

    return <tr>{elems}</tr>;
}

function createRows(headers, rows){

    const elems = [];

    for(let i = 0; i < rows.length; i++){

        const r = rows[i];

        const columns = [];

        for(const name of Object.keys(headers)){

            columns.push(<td key={name}>
                {r[name]?.displayValue ?? r[name]?.value}
            </td>);
            
        }

        elems.push(<tr key={i}>{columns}</tr>);
    }

    

    return elems;
}


function sortRows(rows, sortBy, order){

    order = order.toUpperCase();

    rows.sort((a, b) =>{

        if(a[sortBy] === undefined || b[sortBy] === undefined){
            throw new Error(`Can't sort by key: ${sortBy}`);
        }

        a = a[sortBy].value;
        b = b[sortBy].value;

        const result1 = (order === "ASC") ? 1 : -1;
        const result2 = (order === "ASC") ? -1 : 1;


        if(a < b) return result1;
        if(a > b) return result2;

        return 0;
    });
}

function reducer(state, action){

    switch(action.type){

        case "changeSort": {

            const currentSort = state.sortBy;
            let currentOrder = state.order;

            if(currentSort === action.value){

                if(currentOrder === "ASC"){
                    currentOrder = "DESC";
                }else{
                    currentOrder = "ASC";
                }
            }

            return {
                ...state,
                "sortBy": action.value,
                "order": currentOrder,
               
            }
        }
    }

    return state;
}

export default function InteractiveTable({headers, rows}){

    const [state, dispatch] = useReducer(reducer, {
        "order": "DESC",
        "sortBy": "name"
    });

    sortRows(rows, state.sortBy, state.order);

    return <div className={styles.wrapper}>
        <table>
            <tbody>
                {createHeaders(headers, state, dispatch)}
                {createRows(headers, rows)}
            </tbody>
        </table>
    </div>
}