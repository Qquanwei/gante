import { useContext } from 'react';
import { Context } from './provider';

export default function useGante() {
    return useContext(Context);
}
