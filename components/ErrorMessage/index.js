import React from "react";
import styles from './ErrorMessage.module.css';

class ErrorMessage extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        if(this.props.text === null) return null;

        return <div className={styles.wrapper}>
            <div className={styles.title}>
                Error loading <b>{this.props.title ?? "Component"}</b>
            </div>
            <div className={styles.text}>
                {this.props.text ?? "No error text supplied."}
            </div>
        </div>
    }
}

export default ErrorMessage;