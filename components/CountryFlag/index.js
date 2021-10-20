import Countries from '../../api/countries';
import React from 'react';
import styles from './CountryFlag.module.css';

class CountryFlag extends React.Component{

    constructor(props){

        super(props);
        this.state = {"show": false};

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
    }

    show(){

        this.setState({"show": true});
    }

    hide(){

        this.setState({"show": false});
    }
    

    render(){

        const flag = Countries(this.props.country);

        const hiddenClass = (this.state.show) ? "" : "hidden";

        const hoverElem = (this.state.show) ? <div className={`${styles.mouse} ${hiddenClass}`} onMouseOver={this.hide}>{flag.country}</div> : null;

        return <div className={styles.wrapper} onMouseOver={this.show} onMouseLeave={this.hide}>
            {hoverElem}
            <img className="country-flag" src={`${this.props.host}images/flags/${flag.code.toLowerCase()}.svg`} alt="flag"/>
        </div>;

    }
}

export default CountryFlag;