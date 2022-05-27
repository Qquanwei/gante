import { useEffect, useRef, useState } from 'react';

export default function Play() {
    const ref = useRef();
    const [cood, setCood] = useState({});

    useEffect(() => {
        const onMove = (e) => {
            setCood({
                x: e.offsetX,
                y: e.offsetY
            })
        }
        const ele = ref.current;
        ref.current.addEventListener('mousemove', onMove);

        return () => {
            ele.removeEventListener('mousemove', onMove);
        }
    }, []);

    return (
        <div style={{
            width: 500,
            height: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'black'
        }}>
            <div style={{
                width: 300,
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'orange'
            }}>
                <div ref={ref} style={{
                    width: 200,
                    height: 200,
                    padding: '10px',
                    border: '10px solid black',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white'
                }}>
                    x= { cood.x}, y= {cood.y}
                </div>
            </div>
        </div>
    );
}
