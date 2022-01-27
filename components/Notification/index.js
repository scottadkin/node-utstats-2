import React from 'react';
import styles from './Notification.module.css';


class Notification extends React.Component{

    constructor(props){

        super(props);
        this.state = {"bDisplay": true, "time": 0};
    }

    componentDidMount(){

        this.intervalId = setInterval((() =>{
            this.tick();
        }), 1000);
        //this.setDelay();

    }

    tick(){

        const now = Math.floor(Date.now() * 0.001);

        this.setState({"time": now});

    }

    componentWillUnmount(){

        clearInterval(this.intervalId);
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

    
        if(this.state.time >= this.props.displayUntil) return null;

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