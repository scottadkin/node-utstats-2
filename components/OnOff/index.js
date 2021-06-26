import React from 'react';
import styles from './OnOff.module.css';


class OnOff extends React.Component{

    constructor(props){

        super(props);
    }



    render(){

        const style = {
            "backgroundColor": (this.props.value) ? "green" : "red"
        };

        
        return <div className={styles.wrapper} style={style} onClick={
            (() =>{
                this.props.changeValue(this.props.id, !this.props.value);
            })
        }>
            {(this.props.value) ? "True" : "False"}
        </div>
    }
}

export default OnOff;