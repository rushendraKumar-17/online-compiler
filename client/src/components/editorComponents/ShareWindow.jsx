import React, { useContext, useState } from "react";
import AppContext from "../../context/Context";
import axios from "axios";

const ShareWindow = ({ props }) => {
  const { toggleShareWindow,id } = props;
  const {teammates,apiUrl} = useContext(AppContext);
  const [selectedTeammates, setSelectedTeammates] = useState([]);
  // const teammates = ["Alice", "Bob", "Charlie", "David","a","b","c","d","e","f"];
  const [email, setEmail] = useState("");
  const handleSelect = (teammate) => {
    setSelectedTeammates((prevSelected) =>
      prevSelected.includes(teammate)
        ? prevSelected.filter((name) => name !== teammate)
        : [...prevSelected, teammate]
    );
  };
  const token = localStorage.getItem('token');
  const handleShare = async() => {
    console.log(`Shared with: ${selectedTeammates.join(", ")}`);
    const response =await axios.post(`${apiUrl}/repo/share/${id}`,{team:selectedTeammates},{
      headers:{
        Authorization:`Bearer ${token}`
      }
    });
    console.log(response);
    toggleShareWindow();
  };
  return (
    <div className="p-4">
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
        <div className="bg-gray-900 p-6 rounded shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Select Teammates to Share With
          </h3>
          <ul className="mb-4 max-h-[30vh] overflow-y-auto">
            {teammates.map((teammate) => (
              <li key={teammate.email} className="mb-2">
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={selectedTeammates.includes(teammate.email)}
                    onChange={() => handleSelect(teammate.email)}
                    className="mr-2"
                  />
                  {teammate.name}
                </label>
              </li>
            ))}
          </ul>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleShare}
              className="bg-green-600 text-white px-4 py-2 rounded shadow-md hover:bg-green-700 transition duration-300">
              Share
            </button>
            <button
              onClick={toggleShareWindow}
              className="bg-red-600 text-white px-4 py-2 rounded shadow-md hover:bg-red-700 transition duration-300">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareWindow;
