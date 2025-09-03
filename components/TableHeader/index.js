import styles from "./TableHeader.module.css";

export default function TableHeader({width, children}){
    return <div className={`${styles.wrapper} t-width-${width} center`}>{children}</div>
};