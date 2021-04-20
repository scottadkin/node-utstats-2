import styles from './Option2.module.css';
import React from 'react';

class Option2 extends React.Component{

    constructor(props){

        super(props);

        this.state = {"value": this.props.value};

    }

    changeEvent(id){

        this.props.changeEvent(id);
    }

    render(){


        let margin = -1;

        if(this.props.value === 1){
            margin = 50;
        }

        return (<div className={styles.wrapper}>
            <div className={styles.slider} style={{"marginLeft":`${margin}%`}}></div>
            <div className={styles.option} onClick={(() =>{
                this.changeEvent(0);
            })}>{this.props.title1}</div>
            <div className={styles.option2} onClick={(() =>{
                this.changeEvent(1);
            })}>{this.props.title2}</div>
        </div>);
    }
}


export default Option2;