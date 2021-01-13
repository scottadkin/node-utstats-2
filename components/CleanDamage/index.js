const reduceDamage = (damage) =>{

    damage = damage *= 0.001;

    if(damage < 1000){
        damage = damage.toFixed(2);
    }

    return damage;

}

const CleanDamage = ({damage}) =>{

    damage = parseInt(damage);

    const initials = ['K','M','B','T'];

    let currentInital = '';

    let currentReduction = -1;

    if(damage > 0){

        if(damage * 0.001 >= 1){

            while(damage >= 1000 || currentReduction > initials.length){
                currentReduction++;
                damage = reduceDamage(damage);
            }       

            currentInital = initials[currentReduction];
        }
        
    }
    if(damage !== 0){
        return (<span>{damage} {currentInital}</span>);
    }else{
        return (<span></span>);
    }
}


export default CleanDamage;