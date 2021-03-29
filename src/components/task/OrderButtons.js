export default function OrderButtons({handleIncreasePriority, handleDecreasePriority}){
    return(
        <div className="order-buttons">
            <button onClick={handleIncreasePriority}>up</button>
            <button onClick={handleDecreasePriority}>down</button>
        </div>
    )
}