// src/components/CodeBlock.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import io from 'socket.io-client';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import '../App.css';

const CodeBlock = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [role, setRole] = useState('');
  const [code, setCode] = useState('');
  const [solution, setSolution] = useState('');
  const [studentCount, setStudentCount] = useState(0);
  const [showSmiley, setShowSmiley] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Fetch code block details (including the solution)
  useEffect(() => {
    axios.get(`http://localhost:5001/api/codeblocks/${id}`)
      .then(response => {
        const { initialTemplate, solution } = response.data;
        setCode(initialTemplate);
        setSolution(solution);
      })
      .catch(err => console.error(err));
  }, [id]);

  // Set up socket connection and event listeners
  useEffect(() => {
    socketRef.current = io('http://localhost:5001');
    socketRef.current.emit('joinRoom', { roomId: id });

    socketRef.current.on('roleAssigned', ({ role, userName }) => {
      setRole(role);
    });

    socketRef.current.on('updateCode', ({ code: newCode }) => {
      setCode(newCode);
      setShowSmiley(newCode.trim() === solution.trim());
    });

    socketRef.current.on('studentCount', ({ count }) => {
      setStudentCount(count);
    });

    socketRef.current.on('mentorLeft', () => {
      alert('The mentor has left. Redirecting to lobby.');
      navigate('/');
    });

    // Listen for chat messages
    socketRef.current.on('chatMessage', ({ sender, message }) => {
      setChatMessages(prevMessages => [...prevMessages, { sender, message }]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id, navigate, solution]);

  // Handle code changes (students only)
  const handleCodeChange = (editor, data, value) => {
    if (role === 'student') {
      setCode(value);
      socketRef.current.emit('codeChange', { code: value });
      setShowSmiley(value.trim() === solution.trim());
    }
  };

  // Handle sending a chat message
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      socketRef.current.emit('chatMessage', { message: chatInput });
      setChatInput(''); // Clear input without adding message locally
    }
  };

  return (
    <div className="codeblock-container">
      <h2 className="role-header">{role === 'mentor' ? 'Mentor View' : 'Student View'}</h2>
      <p className="student-count">Students in room: {studentCount}</p>
      <h3>Code Editor</h3>
      <CodeMirror
        value={code}
        options={{
          mode: 'javascript',
          theme: 'default',
          lineNumbers: true,
          readOnly: role === 'mentor',
        }}
        onBeforeChange={handleCodeChange}
      />
      {showSmiley && <div className="smiley">😊</div>}
      
      {/* Chat Panel */}
      <div className="chat-container">
        <h3>Chat</h3>
        <div className="chat-messages">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className="chat-message">
              <strong>{msg.sender}: </strong>{msg.message}
            </div>
          ))}
        </div>
        <form onSubmit={handleChatSubmit} className="chat-form">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default CodeBlock;
