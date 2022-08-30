import React from "react";
import styles from "./FormCheckBox.module.css";

class FormCheckBox extends React.Component{

    constructor(props){

        super(props);

        this.setInitialValue();
        this.changeValue = this.changeValue.bind(this);

    }

    setInitialValue(){

        let value = false;

        if(parseInt(this.props.value) === 1) value = true;

        this.setState = {"value": value};
    }

    componentDidUpdate(prevProps){

        if(prevProps.value !== this.props.value){

            this.setState({"value": this.props.value});
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