import styles from "./BasicButton.module.css";

const BasicButton = ({children, action}) =>{

    
    return <div className={`${styles.wrapper}`} onClick={action}>
        {children}
    </div>
}

export default BasicButton;