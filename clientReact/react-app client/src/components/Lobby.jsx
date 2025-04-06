// src/components/Lobby.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../App.css';

const Lobby = () => {
  const [codeBlocks, setCodeBlocks] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5001/api/codeblocks')
      .then(response => setCodeBlocks(response.data))
      .catch(err => console.error(err));
  }, []);

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
