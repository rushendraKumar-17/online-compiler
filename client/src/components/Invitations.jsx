import React, { useContext } from 'react'
import AppContext from '../context/Context';
import {Link} from "react-router-dom";
const Invitations = () => {
  const { sharedRepos } = useContext(AppContext);
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Invitations</h2>
      {sharedRepos.length > 0 ? (
        <ul className="list-disc pl-5">
          {sharedRepos.map((repo, index) => (
            <li key={index} className="mb-2">
              <Link to={`/repo/share/code-editor/${repo._id}`}>{repo.name}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No invitations available.</p>
      )}
    </div>
  );
}

export default Invitations
