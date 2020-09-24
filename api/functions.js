class Functions{

    static firstCharLowerCase(input){

        let ending = input.substring(1);

        return `${input[0].toLowerCase()}${ending}`;
    }

}

module.exports = Functions;