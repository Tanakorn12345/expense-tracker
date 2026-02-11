import { useEffect, useRef } from "react";

export default function useAutoRefresh(callback, interval = 10000) {
  const savedCallback = useRef();

  // เก็บ callback ล่าสุด
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // ตั้ง interval
  useEffect(() => {
    if (!interval) return;

    const id = setInterval(() => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }, interval);

    return () => clearInterval(id);
  }, [interval]);
}
