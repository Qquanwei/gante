import { useContext } from 'react';
import { Context } from './provider.js';

export default function useGante() {
    return useContext(Context);
}
