import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./features/counterSlice"
import fortnitghtReducer from "./features/fortnitghtSlice"

export const store = configureStore({
    reducer:{
        counterReducer,
        fortnitghtReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch