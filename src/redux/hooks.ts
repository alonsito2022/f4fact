import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux"
import { AppDispatch, RootState } from "./store"
import React, { useEffect } from 'react';

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/*function ListenerComponent() {
    const globalVariable = useAppSelector(state => state.fortnitghtReducer.fortnightValue);
  
    useEffect(() => {
      // Esta función se ejecutará cada vez que globalVariable cambie
      console.log('globalVariable ha cambiado:', globalVariable);
      
      // Puedes realizar acciones adicionales aquí en respuesta al cambio
    }, [globalVariable]); // Agrega globalVariable como dependencia para escuchar cambios
  
    return 100;
  }
  
  export default ListenerComponent;*/