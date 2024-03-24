import styles from "./Tabs.module.css";
import Link from "next/link";

export default function Tabs({options, selectedValue, tabName, url}){

    if(options === undefined) return null;
    if(selectedValue === undefined) selectedValue = "";
    if(url === undefined) url = "";
    if(tabName === undefined) tabName = "";

    const elems = [];

    for(let i = 0; i < options.length; i++){

        const o = options[i];
 
        let currentClass = styles.tab;

        if(o.value.toLowerCase() === selectedValue.toLowerCase()){
            currentClass += ` ${styles.selected}`;
        }

        elems.push(<Link key={i} href={`${url}?${tabName}=${o.value}`}>
            <div className={currentClass}>
                {o.name}
            </div>
        </Link>);
    }

    return <div className={styles.wrapper}>
        {elems}
    </div>
}