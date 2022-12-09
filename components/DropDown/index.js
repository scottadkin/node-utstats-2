import React from "react";
import styles from "./DropDown.module.css";

class DropDown extends React.Component{

    constructor(props){

        super(props);
        this.state = {"bActive": false, "selectedValue": null};

        this.changeActive = this.changeActive.bind(this);
        this.changeSelected = this.changeSelected.bind(this);
        this.hide = this.hide.bind(this);
    }

    changeActive(){

        const previous = this.state.bActive;
        this.setState({"bActive": !previous});
    }

    hide(){

        this.setState({"bActive": false});
    }

    changeSelected(value){

        if(!this.state.bActive) return;
        this.setState({"selectedValue": value});

        this.props.changeSelected(this.props.fName, value);
    }


    renderEntries(){

        const elems = [];


        for(const [value, displayValue] of Object.entries(this.props.data)){

            if(!this.state.bActive){

                if(this.state.selectedValue === null){

                    elems.push(<div className={styles.fake} key={value}>{displayValue}</div>);
                    break;

                }else{           

                    if(value === this.state.selectedValue){
                        elems.push(<div className={styles.fake} key={value}>{displayValue}</div>);
                        break;
                    }
                }

            }else{

                let className = `${styles.entry}`;

                if(value === this.state.selectedValue){
                    className += ` ${styles.selected}`
                }

                elems.push(<div className={className} key={value} onClick={(() =>{
                    this.changeSelected(value);
                })}>{displayValue}</div>);
            }
        }

        const zStyle = (this.state.bActive) ? {"position":"relative", "width": "100%"} : {};

        return <div className={styles.entries} style={zStyle} onClick={this.changeActive}>
            {elems}
        </div>
    }

    render(){

        

        return <div className={styles.wrapper}>  
            <div className={styles.label}>
                {this.props.dName}
            </div>
            <div className={styles.dd}>
                {this.renderEntries()}
            </div>
        </div>
    }
}

export default DropDown;