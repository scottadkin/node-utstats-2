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

    componentDidUpdate(prevProps){

        if(prevProps.originalValue !== this.props.originalValue){
            this.setState({"selectedValue": this.props.originalValue})
        }
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

        for(let i = 0; i < this.props.data.length; i++){

            const {value, displayValue} = this.props.data[i];

            if(!this.state.bActive){

                if(this.state.selectedValue === null){

                    elems.push(<div className={styles.fake} key={"null"}>Please select value</div>);
                    break;

                }else{           
                    if(value === this.state.selectedValue){
                        elems.push(<div className={styles.fake} key={`${i}-${value}`}>{displayValue}</div>);
                        break;
                    }
                }

            }else{

                let className = `${styles.entry}`;

                if(value === this.state.selectedValue){
                    className += ` ${styles.selected}`;
                }

                elems.push(<div className={className} key={`${i}-${value}`} onClick={(() =>{
                    this.changeSelected(value);
                })}>{displayValue}</div>);
            }
        }

        //just incase there is a value that is not in the dataset
        if(elems.length === 0){

            if(this.props.data.length > 0){

                const data = this.props.data[0];

                elems.push(<div className={styles.fake} key={data.value} onClick={(() =>{
                    this.changeSelected(data.value);
                })}>{data.displayValue}</div>);

            }
        }
 
        const zStyle = (this.state.bActive) ? {"position":"relative", "width": "100%", "border": "1px solid var(--border-color-3)"} : { "overflow": "hidden"};

        return <div className={styles.entries} onMouseLeave={this.hide} style={zStyle} onClick={this.changeActive}>
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

        const style = {};

        if(this.props.bForceSmall !== undefined){

            style.width = "var(--textbox-width-1)";
            style.maxWidth = "var(--textbox-max-width-1)";
        }

        return <div className={styles.wrapper} onClick={this.hide}>  
            <div className={styles.label}>
                {this.props.dName}
            </div>
            <div className={styles.dd} style={style}>
                {this.renderEntries()}
            </div>
        </div>
    }
}

export default DropDown;