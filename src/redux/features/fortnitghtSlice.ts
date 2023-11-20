import {createSlice} from "@reduxjs/toolkit"
export const fortnightSlice = createSlice({
    name:'fortnightValue',
    initialState:{
        fortnightValue:0
    },
    reducers: {
        saveFortnightValue:(state, action)=>{
            state.fortnightValue = action.payload;
        }
    }
})

export const {saveFortnightValue} = fortnightSlice.actions
export default fortnightSlice.reducer