import styles from "./TabsHeader.module.css";

const TabsHeader = (props) =>{

    return <div className={styles.wrapper}>{props.children}</div>
}
export default TabsHeader;