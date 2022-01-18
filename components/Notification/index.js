import React from 'react';
import styles from './Notification.module.css';


class Notification extends React.Component{

    constructor(props){

        super(props);
        this.state = {"bDisplay": true};
    }

    componentDidMount(){

        this.setDelay();

    }

    startTimer(){

        const timer = setInterval(() =>{

            const now = Math.floor(Date.now() * 0.001);

            if(now >= this.props.displayUntil){
                this.setState({"bDisplay": false});
                clearInterval(timer);
            }

        }, 100);
    }

    componentDidUpdate(prevProps){

        if(this.props.displayUntil !== prevProps.displayUntil){
            this.setDelay();
        }
    }

    setDelay(){

        this.setState({"bDisplay": true});
        this.startTimer();
    
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

        return <div className={`${styles.wrapper} ${this.getColorClass()}`}>
            <div className={styles.header}>
                {this.getTitle()}
            </div>
            
            <div className={styles.content}>
                {this.props.children}
            </div>
        </div>
    }
}

export default Notification;