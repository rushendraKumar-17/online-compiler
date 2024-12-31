import React, { useContext } from 'react'
import AppContext from '../context/Context'

const TeammatesPage = () => {
  const { teammates } = useContext(AppContext);
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Team mates</h1>
      <ul className="list-disc pl-5">
        {teammates ? (
          teammates.length > 0 ? (
            teammates.map((teammate, index) => (
              <li key={index} className="mb-2">
                <p className="text-lg">Name: {teammate.name}</p>
                <p className="text-sm text-gray-600">Email: {teammate.email}</p>
              </li>
            ))
          ) : (
            <div className="text-red-500">No teammates found.</div>
          )
        ) : (
          <div>Loading...</div>
        )}
      </ul>
    </div>
  )
}

export default TeammatesPage
