import React from "react";
import styles from "./DropDown.module.css";
import ErrorMessage from "../ErrorMessage";

class DropDown extends React.Component{

    constructor(props){

        super(props);

        this.state = {"bActive": false, "selectedValue": this.props.originalValue ?? null};
        
        //this.setOrginalValue();

        this.changeActive = this.changeActive.bind(this);
        this.changeSelected = this.changeSelected.bind(this);
        this.hide = this.hide.bind(this);
    }


    setOrginalValue(){

        if(this.props.originalValue !== undefined){
            this.setState({"selectedValue": this.props.originalValue});
        }
    }

    changeActive(){

        const previous = this.state.bActive;
        this.setState({"bActive": !previous});
    }

    hide(){

        if(!this.state.bActive) return;

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

                    elems.push(<div className={styles.fake} key={"null"}>Please select value</div>);
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

        //just incase there is a value that is not in the dataset
        if(elems.length === 0){

            if(Object.keys(this.props.data).length > 0){

                const firstKey = Object.keys(this.props.data)[0];
                const data = this.props.data[firstKey];

                elems.push(<div className={styles.fake} key={firstKey} onClick={(() =>{
                    this.changeSelected(firstKey);
                })}>{data}</div>);

            }
        }
 
        const zStyle = (this.state.bActive) ? {"position":"relative", "width": "100%", "border": "1px solid var(--border-color-3)"} : { "overflow": "hidden"};

        return <div className={styles.entries} style={zStyle} onClick={this.changeActive}>
            {elems}
        </div>
    }

    render(){
        
        if(this.props.data === undefined){
            return <ErrorMessage title={`DropDown (${this.props.dName})`} text="No data supplied."/>
        }

        if(this.props.data === null){
            return <ErrorMessage title={`DropDown (${this.props.dName})`} text="Data is null."/>
        }

        return <div className={styles.wrapper} onClick={this.hide}>  
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