import React from 'react';
import styles from './PlayersDropDown.module.css';

class PlayersDropDown extends React.Component{

    constructor(props){

        super(props);
    }

    createOptions(){

        const options = [];

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            options.push(<option key={i} value={p.id}>{p.name}</option>);
        }

        return options;
    }


    render(){

        return <div>
                <div className="select-row">
                    <div className="select-label">Player {this.props.id + 1} 
                        <div className={styles.delete} onClick={(() =>{
                            this.props.delete(this.props.id);
                        })}>X</div>
                    </div>
                    <div>
                        <select className="default-select" value={this.props.selected} onChange={((e) =>{

                            this.props.changeSelected(this.props.id, e);
                        })}>
                            <option value="-1">Select A Player</option>
                            {this.createOptions()}
                        </select>
                    </div>
                </div>
            </div>
    }
}

export default PlayersDropDown;