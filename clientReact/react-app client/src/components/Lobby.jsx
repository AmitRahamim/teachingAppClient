// src/components/Lobby.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../App.css';

const Lobby = () => {
  const [codeBlocks, setCodeBlocks] = useState([]);

  const serverUrl = 'https://teachingappserver-production-c351.up.railway.app';

  useEffect(() => {
    axios.get(`${serverUrl}/api/codeblocks`)
      .then(response => {
        console.log(response.data); // Log the response to verify it's an array
        setCodeBlocks(response.data);
      })
      .catch(err => console.error(err));
  }, [serverUrl]);
  return (
    <div className="container">
      <div class="header-div">
          <h1 className="lobby-title">Choose a Code Block</h1>
      </div>
      <div class="code-div">
        {codeBlocks.length === 0 ? (
          <p>No code blocks available. Please add some code blocks to the database.</p>
        ) : (
          <ul className="codeblock-list">
            {codeBlocks.map(cb => (
              <li key={cb._id} className="codeblock-card">
                <Link to={`/codeblock/${cb._id}`}>{cb.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Lobby;
