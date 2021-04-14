const HighlightedText = ({text,color}) => {
    const rgbValues = {
        pink: {r: 244, g:62, b:223},
        blue: {r:62, g: 223, b:244},
        orange: {r:244, g:129, b:62},
        green: {r:86, g:244, b:62}

    }

   
    // This function takes in a rgb color and returns a background with two linear gradients
    const background = ({r,g,b}) => {
        const firstAngle = 101; // returns a random number between 103 and 99
        const firstSpread = [.9,2.4,5.8,93, 96, 98]
        const firstDensity = [0,1.25,0.5,0.3,0.7,0]


        const secondAngle = 275;
        const secondSpread = [0,7.9,16];
        const secondDensity = [0,0.3,0]

        return `linear-gradient(${firstAngle}deg, rgba(${r},${g},${b},${firstDensity[0]}) ${firstSpread[0]}%,rgba(${r},${g},${b},${firstDensity[1]}) ${firstSpread[1]}%,rgba(${r},${g},${b},${firstDensity[2]}) ${firstSpread[2]}%,rgba(${r},${g},${b},${firstDensity[3]}) ${firstSpread[3]}%,rgba(${r},${g},${b},${firstDensity[4]}) ${firstSpread[4]}%,rgba(${r},${g},${b},${firstDensity[5]}) ${firstSpread[5]}%), linear-gradient(${secondAngle}deg, rgba(${r},${g},${b},${secondDensity[0]}) ${secondSpread[0]}%,rgba(${r},${g},${b},${secondDensity[1]}) ${secondSpread[1]}%,rgba(${r},${g},${b},${secondDensity[2]}) ${secondSpread[2]}%)`;
    }

    // If one of the colors if from a predetermined list make a marked element

    if (color==="orange"){
        return <mark style={ { background: background(rgbValues.orange) } }> {text} </mark>
    }
    if (color==="green"){
        return <mark style={ { background: background(rgbValues.green) } }> {text} </mark>
    }
    if (color==="blue"){
        return <mark style={ { background: background(rgbValues.blue) } }> {text} </mark>
    }
    if (color==="pink"){
        return <mark style={ { background: background(rgbValues.pink) } }> {text} </mark>
    }
    
    return text
}

export default HighlightedText