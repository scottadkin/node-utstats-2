import React from "react";
import Loading from "../Loading";
import styles from "./NexgenStatsViewerPreview.module.css";
import Image from "next/image";


class NexgenStatsViewerPreview extends React.Component{

    constructor(props){

        super(props);
        this.state = {"data": null};
    }

    async componentDidMount(){

        await this.loadData();
    }

    async loadData(){

        const req = await fetch("/api/nexgenstatsviewer");

        const response = await req.text();

        this.parseText(response);
    }


    parseText(data){

        const titleReg = /^beginlist "(.+?)"$/im;
        const lineReg = /^addplayer "(.+?)" (.+?) (.+?) (.+?)$/im;

        const lines = data.match(/(.+)/img);

        if(lines === null) return;

        const lists = [];

        for(let i = 0; i < lines.length; i++){

            const c = lines[i];

            const titleResult = titleReg.exec(c);

            if(titleResult !== null){
                lists.push({"title": titleResult[1],"data": []});
                continue;
            }

            const lineResult = lineReg.exec(c);

            if(lineResult !== null){

                const player = {
                    "name": lineResult[1],
                    "value": lineResult[2],
                    "flag": lineResult[3],
                    "icon": lineResult[4]
                };

                lists[lists.length - 1].data.push(player);
            }
        }

        this.setState({"data": lists});
        
    }

    renderLists(){

        if(this.state.data === null) return <Loading />;

        if(this.state.data.length === 0){

            return <div className={`${styles.none} center`}>
                <div className={styles.title}>No Lists Found</div>
                <div className={styles.line}>No data.</div>
            </div>
        }


        const lists = [];

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            let rows = [];

            for(let x = 0; x < d.data.length; x++){
                
                const positionColor = (x === 0) ? styles.first : (x === 1) ? styles.second : (x === 2) ? styles.third : "";

                const p = d.data[x];

                let icon = "nochange";

                if(p.icon !== "nc"){
                    icon = p.icon;
                }

                rows.push(<div key={`${i}-${x}`} className={`${styles.line} ${positionColor}`}>
                    <div className={styles.place}>
                        {x+1}.
                    </div>
                    <div className={styles.flag}>
                        <Image src={`/images/flags/${p.flag}.svg`} width={16} height={11} alt="flag"/>
                    </div>
                    <div className={styles.name}>
                        {p.name}
                    </div>
                    <div className={styles.score}>
                        {p.value}
                    </div>
                    <div className={styles.icon}>
                        <Image src={`/images/${icon}.png`} alt="icon" width={10} height={10}/>
                    </div>
                </div>);
            }

            lists.push(
                <div key={i} className={styles.list}>
                    <div className={styles.title}>
                        {d.title}
                    </div>
                    {rows}
                </div>
            );
        }


        return <div className={`${styles.wrapper} center`}>
            {lists}
        </div>
    }

    render(){

        return <div>
            <div className="default-header">NexgenStatsViewer Preview</div>
            {this.renderLists()}
        </div>
    }
}

export default NexgenStatsViewerPreview;