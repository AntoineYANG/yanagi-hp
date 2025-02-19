"use client";

import { useEffect, useState, type FC } from "react";


const LocalTime: FC<{ z: number }> = ({ z }) => {
  const [curTimeZone, setCurTimeZone] = useState(0);
  const [curTime, setCurTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const updateTime = () => {
      const now = new Date();
      setCurTimeZone(-1 * now.getTimezoneOffset() / 60);
      setCurTime(now.getTime());
      interval = setTimeout(updateTime, 1_000 * 15);
    };
    interval = setTimeout(updateTime, 0);
    return () => {
      clearTimeout(interval);
    };
  }, []);

  if (curTime === 0) {
    return <span>--</span>;
  }

  const tarTime = curTime + (z - curTimeZone) * 1_000 * 60 * 60;
  const d = new Date(tarTime);
  const diff = z - curTimeZone;

  return (
    <>
      <span>{`${d.getHours()}:${d.getMinutes()}`.replace(/:\d$/, v => `:0${v.slice(1)}`)}</span>
      {diff > 0 && (
        <>
          <span className="text-gray-500">&nbsp;-&nbsp;</span>
          <span className="text-gray-700">{diff}h ahead</span>
        </>
      )}
      {diff < 0 && (
        <>
          <span className="text-gray-500">&nbsp;-&nbsp;</span>
          <span className="text-gray-700">{-diff}h behind</span>
        </>
      )}
    </>
  );
};

export default LocalTime;
