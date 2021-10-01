import React, {useState, useEffect} from 'react';
import { NetworkConnector } from '@web3-react/network-connector';

export const network = new NetworkConnector({
    urls: { 137: "https://rpc-mainnet.maticvigil.com/" },
    defaultChainId: 137
})

export default function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}