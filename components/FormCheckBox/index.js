import React from "react";
import styles from "./FormCheckBox.module.css";

class FormCheckBox extends React.Component{

    constructor(props){

        super(props);
        
        this.state = {"value": Boolean(this.props.value) ?? false};
        this.changeValue = this.changeValue.bind(this);

    }

    componentDidUpdate(prevProps){
        if(prevProps.value !== this.props.value){
            this.setState({"value": Boolean(this.props.value) ?? false});
        }
    }

    changeValue(){

        const currentValue = this.state.value;
        this.props.updateValue(this.props.valueName, !currentValue);
        this.setState({"value": !currentValue});
        
    }

    render(){

        return <div>
            <input type="hidden" name={this.props.inputName} value={this.state.value}/>
            <div className={`${styles.button} ${(this.state.value) ? "team-green" : "team-red"}`} onClick={this.changeValue}>
                {(this.state.value) ? "True" : "False"}
            </div>
        </div>
    }
}

export default FormCheckBox;