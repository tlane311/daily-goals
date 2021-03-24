export default function useLocalStorage(){

    const addItem = (key,value) => {
        return localStorage.setItem(key,value);
    }
    const removeItem = (key) => {
        return localStorage.removeItem(key);
    }

    const clearStorage = () => {
        return localStorage.clear();
    }

    return [localStorage, addItem, removeItem, clearStorage];
}