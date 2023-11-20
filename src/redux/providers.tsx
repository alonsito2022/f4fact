'use client'
import { Provider } from "react-redux";
import {store} from "./store";
interface Props { children: React.ReactNode }
const ReduxProviders=({children}: Props)=>{
    return <Provider store={store}>{children}</Provider>
}
export default ReduxProviders;