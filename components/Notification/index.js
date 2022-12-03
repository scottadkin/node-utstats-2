import React from 'react';
import styles from './Notification.module.css';


class Notification extends React.Component{

    constructor(props){

        super(props);
        this.state = {"bDisplay": true};
        this.close = this.close.bind(this);
    }
    

    componentDidUpdate(prevProps){

        if(this.props.children !== prevProps.children){
            this.setState({"bDisplay": true});
        }
    }

    close(){
        this.setState({"bDisplay": false});
    }

    getTitle(){

        const type = this.props.type ?? "default";

        switch(type){

            case "pass": return "Pass"
            case "warning": return "Warning";
            case "error": return "Error";
            default: return "Notification";
        }

    }

    getColorClass(){

        const type = this.props.type ?? "default";

        switch(type){

            case "pass": return styles.pass;
            case "warning": return styles.warning;
            case "error": return styles.error;
            default: return styles.default;
        }

    }



    render(){

        if(!this.state.bDisplay) return null;

        if(this.props.children === "") return null;

        const closeElem = (this.props.hideClose !== undefined) ? null : <div className={styles.exit} onClick={this.close}>
            Close
        </div>;

        return <div className={`${styles.wrapper} ${this.getColorClass()}`}>
            
            <div className={styles.header}>
                {this.getTitle()}
            </div>
            
            <div className={styles.content}>
                {this.props.children}
            </div>

            {closeElem}
        </div>
    }
}

export default Notification;