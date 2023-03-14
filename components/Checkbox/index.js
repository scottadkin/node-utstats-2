import styles from "./Checkbox.module.css";

const Checkbox = ({name, checked, setChecked}) =>{

    const className = (checked) ? "team-green" : "team-red";
    const content = (checked) ? <>&#10004;</>  : null;

    return <div className={`${styles.wrapper} ${className}`} onClick={() => setChecked(name)}>
        {content}
    </div>
}

export default Checkbox;