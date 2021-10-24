import React from 'react';
import styles from './PlayersDropDown.module.css';

class PlayersDropDown extends React.Component{

    constructor(props){

        super(props);

        this.state = {"playerCache": {}};

        this.addAlias = this.addAlias.bind(this);
    }

    addAlias(e){

        const id = parseInt(e.target.value);

        if(id === -1) return;

        e.target.value = -1;

        this.props.addAlias(this.props.id, id);

    }

    getPlayerName(id){

        const cache = this.state.playerCache;

        if(cache[id] !== undefined) return cache[id];

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            if(cache[p.id] === undefined) cache[p.id] = p.name;

            if(p.id === id){
                return p.name;
            }
        }
 
    }

    createOptions(){

        const options = [];

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            options.push(<option key={i} value={p.id}>{p.name}</option>);
        }

        return options;
    }


    renderAliases(){
        
        const elems = [];

        for(let i = 0; i < this.props.aliases.length; i++){

            const a = this.props.aliases[i];

            elems.push(<span key={i} className={styles.alias} onClick={(() => {
                this.props.deleteAlias(this.props.id, a);
            })}>{this.getPlayerName(a)}</span>);
        }
        return <>
            {elems}
        </>
    }

    render(){

        return <div className={styles.wrapper}>
                <div className="default-sub-header-alt">Player {this.props.id + 1} </div>
                <div className="select-row">
                    <div className="select-label">
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
                <div className="select-row">
                    <div className="select-label">
                        Aliases
                    </div>
                    <div>
                        
                    <select className="default-select"  onChange={this.addAlias}>
                        <option value="-1">Select A Player</option>
                        {this.createOptions()}
                    </select>
                    </div>
                </div>
                <div className={styles.aliases}>{this.renderAliases()}</div>
           
            </div>
    }
}

export default PlayersDropDown;