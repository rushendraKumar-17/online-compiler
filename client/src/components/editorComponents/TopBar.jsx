import React from 'react'
import { Button } from '@mui/material';
const TopBar = ({props}) => {
  const {handleRun,toggleShareWindow,enableShare} = props;
  return (
    <div className="bg-gray-950 text-white h-[5vh] flex justify-end gap-2 items-center">
        <Button variant="outlined" onClick={handleRun} className="border border-gray-500 h-[4vh]">
          Run
        </Button>
        {enableShare && <Button onClick={toggleShareWindow} variant="outlined" className="border border-gray-500">Share</Button>}
      </div>
  )
}

export default TopBar
