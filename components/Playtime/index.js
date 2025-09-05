import styles from "./Playtime.module.css";
import { toPlaytime } from "../../api/generic.mjs";


export default function Playtime({timestamp}){

    return <div className={styles.wrapper}>
        {toPlaytime(timestamp)}
    </div>
}
