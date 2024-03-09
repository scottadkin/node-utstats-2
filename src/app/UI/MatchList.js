"use client"
import MatchBox from "./MatchBox";
import styles from "./MatchList.module.css"


export default function MatchesList({matches}){


    return <div className={`center ${styles.wrapper}`}>

        {matches.map((m, i) =>{
            return <MatchBox 
                key={i}
                data={m} 
            />
        })}
    </div>
}