import React from "react";
import styles from "./FormCheckBox.module.css";

class FormCheckBox extends React.Component{

    constructor(props){

        super(props);

        this.state = {"value": null};

        this.changeValue = this.changeValue.bind(this);

    }

    componentDidMount(){

        this.setInitialValue();
    }

    setInitialValue(){

        let value = false;


        if(this.props.value !== true && this.props.value !== false){
            if(parseInt(this.props.value) === 1) value = true;
            if(parseInt(this.props.value) === 0) value = false;
        }else{

            value = this.props.value;
        }
        
        this.setState({"value": value});
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

        if(this.state.value === null) return null;

        let bTable = false;

        if(this.props.bTable !== undefined){

            bTable = this.props.bTable;
        }

        const elems = <>
            <input type="hidden" name={this.props.inputName} value={this.state.value}/>
            <div className={`${styles.button} ${(this.state.value) ? "team-green" : "team-red"}`} onClick={this.changeValue}>
                {(this.state.value) ? "True" : "False"}
            </div>
        </>
        
        if(!bTable){
            return <div>
                {elems}
            </div>
        }

        return <td>
            {elems}
        </td>
    }
}

export default FormCheckBox;