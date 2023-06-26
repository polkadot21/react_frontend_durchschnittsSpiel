import React, { useEffect, useState } from "react";

export const CountdownTimer = ({ blocks }: { blocks: number }) => {
  const [countDown, setCountDown] = useState(blocks * 12 * 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown((prevCountDown) => prevCountDown - 1000); // Уменьшаем таймер на 1 секунду (1000 миллисекунд)

      if (countDown <= 0) {
        clearInterval(interval);
        setCountDown(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCountDown(blocks * 12 * 1000);
  }, [blocks]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / (1000 * 60));
    const seconds = Math.floor((time / 1000) % 60);
    return `${minutes}м ${seconds}с`;
  };

  return countDown > 0 ? (
    <div>
      <h2>Countdown timer</h2>
      <div>{formatTime(countDown)}</div>
    </div>
  ) : null;
};

export default CountdownTimer;
