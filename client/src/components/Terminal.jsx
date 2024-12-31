import React, { useState } from "react";

const Terminal = ({props}) => {
  const {closeTerminal,output,execResult} = props;
  return (
    <div className="fixed bottom-0 bg-black h-[20vh] text-white w-full z-10">
      <button onClick={closeTerminal} className="left-[75vw] absolute">X</button>
      {
        execResult.error ? <div className="w-full">
          <div>Compilation failed!!!</div>
          <div className="text-wrap w-full">{execResult.result.split(",")[1]}</div>
        </div> : <div>
          <div>Compilation successful!!!</div>
          <div>
            {execResult.result}
          </div>
        </div>
      }
    </div>
  );
};

export default Terminal;
