import { useEffect, useState } from 'react';

/**
 * Hook for debouncing any value after specific delay in milliseconds
 * @param value Value to be debounced
 * @param delay Delay in milliseconds after which the value is updated
 * @returns Object containing debounced value and boolean incicating whether debouncing is in progress
 */
export function useDebounce(value: any, delay: number = 500): { debouncedValue: any, isDebouncing: boolean } {
    const [ debouncedValue, setDebouncedValue ] = useState<any>(value);
    const [ isDebouncing, setIsDebouncing ] = useState<boolean>(false);
    
    useEffect(() => {
        setIsDebouncing(true);
        const timeoutHandler = setTimeout(() => {
            setDebouncedValue(value);
            setIsDebouncing(false);
        }, delay);

        return () => {
            clearTimeout(timeoutHandler);
            setIsDebouncing(false);
        };
    }, [value, delay]);

    return { debouncedValue, isDebouncing };
}