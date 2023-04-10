import { useReducer } from "react";
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
    }

    return state;
}

const CalendarThing = () =>{

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const [state, dispatch] = useReducer(reducer, {
        "year": year,
        "month": month
    });

    const day = ((60 * 60) * 24) * 1000;

    
    //console.log(month);

    //console.log(new Date(year, month + 1, 0));

    const currentMonth = new Date(state.year, state.month);

    const elems = [];

    const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();

    //console.log(test.getDate());

    const currentDate = now.getDate();

    for(let i = 0; i < daysInMonth; i++){

        let className = styles.day;

        if(year === currentMonth.getFullYear() && month === currentMonth.getMonth() && i + 1 === currentDate){
            className += ` ${styles.today}`;
        }

        elems.push(<div className={className} key={i}>
            {i + 1}
        </div>);
    }

    

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
        <div className={`${styles.days} center`}>
        {elems}
        </div>
        
    </div>
}

export default CalendarThing;