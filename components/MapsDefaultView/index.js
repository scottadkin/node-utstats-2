import MapDefaultBox from "../MapDefaultBox";
import styles from "./MapsDefaultView.module.css";

const MapsDefaultView = ({data, host}) =>{

    const elems = data.map((d) =>{
        return <MapDefaultBox key={d.id} host={host} data={d}/>
    });
      
   return <div className={styles.wrapper}>{elems}</div>;
}

export default MapsDefaultView;