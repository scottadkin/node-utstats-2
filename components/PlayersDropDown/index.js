import React from 'react';
import styles from './PlayersDropDown.module.css';

class PlayersDropDown extends React.Component{

    constructor(props){

        super(props);

        this.state = {"aliases": [], "playerCache": {}};

        this.addAlias = this.addAlias.bind(this);
    }

    deleteAlias(id){

        const newAliases = [];

        for(let i = 0; i < this.state.aliases.length; i++){

            const a = this.state.aliases[i];

            if(a !== id){
                newAliases.push(a);
            }
        }

        this.setState({"aliases": newAliases});
    }

    addAlias(e){

        const id = parseInt(e.target.value);

        const previousAliases = [...this.state.aliases];

        if(previousAliases.indexOf(id) === -1){
            previousAliases.push(id);
            this.setState({"aliases": previousAliases});
        }

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

        for(let i = 0; i < this.state.aliases.length; i++){

            const a = this.state.aliases[i];

            elems.push(<span key={i} className={styles.alias} onClick={(() => {
                this.deleteAlias(a);
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