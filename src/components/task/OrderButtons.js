export default function OrderButtons({handleIncreasePriority, handleDecreasePriority}){
    return(
        <div className="order-buttons">
            <button className="up-btn" onClick={handleIncreasePriority}/>
            <button className="down-btn" onClick={handleDecreasePriority}/>
        </div>
    )
}