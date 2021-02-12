import styles from './Option2.module.css';

class Option2 extends React.Component{

    constructor(props){

        super(props);

        this.state = {"value": this.props.value};

    }

    render(){


        let margin = -1;

        if(this.props.value === 1){
            margin = 75;
        }

        return (<div className={styles.wrapper}>
            <div className={styles.slider} style={{"marginLeft":`${margin}px`}}></div>
            <div className={styles.option} onClick={this.props.leftEvent}>{this.props.title1}</div>
            <div className={styles.option2} onClick={this.props.rightEvent}>{this.props.title2}</div>
        </div>);
    }
}


export default Option2;