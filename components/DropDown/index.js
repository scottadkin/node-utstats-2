import React from "react";
import styles from "./DropDown.module.css";

class DropDown extends React.Component{

    constructor(props){

        super(props);
        this.state = {"bActive": false, "selectedValue": null};

        this.changeActive = this.changeActive.bind(this);
        this.changeSelected = this.changeSelected.bind(this);
    }

    changeActive(){

        const previous = this.state.bActive;
        this.setState({"bActive": !previous});
    }

    changeSelected(value){
        if(!this.state.bActive) return;
        this.setState({"selectedValue": value});
    }

    renderEntries(){

        const elems = [];

        let index = 0;

        for(const [key, value] of Object.entries(this.props.data)){

            if(!this.state.bActive && index > 0) break;

            elems.push(<div className={styles.entry} key={key} onClick={(() =>{
                this.changeSelected(key);
            })}>{value}</div>);
            index++;
        }

        return <div className={styles.entries} onClick={this.changeActive}>
            {elems}
        </div>
    }

    render(){

        

        return <div>{this.state.selectedValue}
            <div className={styles.wrapper}>
            <div className={styles.label}>
                {this.props.dName}
            </div>
            {this.renderEntries()}
        </div>
        </div>
    }
}

export default DropDown;