import React from 'react'

const TopBar = ({props}) => {
  const {handleRun,toggleShareWindow,enableShare} = props;
  return (
    <div className="bg-gray-950 text-white h-[5vh] flex justify-end gap-2 items-center">
        <button onClick={handleRun} className="border border-gray-500 h-[4vh]">
          Run
        </button>
        {enableShare && <button onClick={toggleShareWindow} className="border border-gray-500">Share</button>}
      </div>
  )
}

export default TopBar
