import '../../component-styles/sticky-nav.css'

//  listOfStickies is an array: ['Sticky1', 'Sticky2', 'Sticky3',...]
//  handleStickySelect is a callback that will update state in App

export default function StickiesBar({listOfStickies, handleStickySelect}) {
    return(
        <nav id="sticky-nav">
            <ul>
                {listOfStickies.map( sticky => {
                    return (<li onClick={handleStickySelect}> {sticky} </li>)
                })}
            </ul>
        </nav>
    )
}