// ChatApp.js
import React, { useState, useEffect } from 'react';
import Login from './Login';
import ChatRoomList from './ChatRoomList';
import ChatUserList from './ChatUserList';
import './ChatApp.css'; // CSS 파일 가져오기
import axios from 'axios';

function ChatApp() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [users, setUsers] = useState([]);

  // 사용자 목록 가져오기
  useEffect(() => {
    if (loggedIn) {
      axios.get('http://localhost:8080/api/users') // 주소 수정
        .then((response) => {
          if (response.status === 200) {
            // 자신의 정보를 제외하고 사용자 목록을 설정
            const filteredUsers = response.data.filter((user) => user.name !== username);
            setUsers(filteredUsers);
          } else {
            console.error('사용자 목록을 불러오는 중 오류가 발생했습니다.');
          }
        })
        .catch((error) => {
          console.error('사용자 목록을 불러오는 중 오류가 발생했습니다.', error);
        });
    }
  }, [loggedIn]);


  useEffect(() => {
    if (loggedIn) {
      const newSocket = new WebSocket(`ws://localhost:8080/ws/chat?username=${username}`);
      setSocket(newSocket);

      newSocket.onmessage = (event) => {
        const message = event.data;
        console.log(message);
        setMessages((prevMessages) => [...prevMessages, message]);
      };

      return () => newSocket.close();
    }
  }, [loggedIn]);

  const handleSendMessage = () => {
    console.log("보냄");
    if (socket && inputMessage.trim()) {
      const messageObject = {
        command: "send",
        content: inputMessage,
        sender: username,
        chatRoomId: selectedChatRoom,
        participants: []
      };

      socket.send(JSON.stringify(messageObject));
      setInputMessage('');
    }
  };

  const handleLogin = (user) => {
    setUsername(user);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUsername('');
    // 기타 로그아웃 처리 작업을 수행할 수 있습니다.
  };

  const handleChatRoomSelect = (chatRoomId) => {
    setSelectedChatRoom(chatRoomId);
    // 선택한 채팅방에 대한 메시지 불러오는 로직 추가 가능
  };

  const handleStartChat = (otherUsername) => {
    // 현재 사용자와 다른 사용자의 이름을 알파벳 순으로 정렬하여 채팅방 ID 생성
    const chatRoomId = [username, otherUsername].sort().join("_");

    // 서버에 채팅방 참가 요청 보내기
    socket.send(JSON.stringify({
      command: "join",
      content: "",
      sender: username,
      chatRoomId: chatRoomId,
      participants: [username, otherUsername]
    }));

    // 서버에 채팅방 존재 여부 확인 요청 (여기서는 예시로 GET 요청을 사용)
    axios.get(`http://localhost:8080/api/chatrooms/${chatRoomId}`)
      .then(response => {
        if (response.status === 200 && response.data) {
          // 채팅방이 존재하는 경우, 해당 채팅방으로 이동
          setSelectedChatRoom(chatRoomId);
        } else {
          // 채팅방이 존재하지 않는 경우, 새로운 채팅방 생성
          axios.post('http://localhost:8080/api/chatrooms', {
            id: chatRoomId,
            participants: [username, otherUsername]
          }).then(response => {
            if (response.status === 200) {
              setSelectedChatRoom(chatRoomId);
            } else {
              console.error('채팅방 생성 중 오류 발생');
            }
          }).catch(error => {
            console.error('채팅방 생성 중 오류 발생', error);
          });
        }
      })
      .catch(error => {
        console.error('채팅방 존재 여부 확인 중 오류 발생', error);
      });
  };

  return (
    <div>
      {loggedIn ? (
        <div>
          <div className="sidebar">
            <ChatUserList users={users} onUserClick={handleStartChat} />
            <div>
              <h2>내 채팅방</h2>
              <ChatRoomList username={username} />
            </div>
          </div>
          {selectedChatRoom ? (
            <div className="message-container">
              <h2>{selectedChatRoom} 채팅방</h2>
                {messages.map((msg, index) => {
                  const message = JSON.parse(msg);
                  const isOwnMessage = message.sender === username;
                  console.log("센더" + message.sender)
                  console.log("나일까?" + isOwnMessage);
                  const messageStyle = {
                    maxWidth: '60%', // 메시지 말풍선의 최대 너비
                    alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                  };
  
                  return (
                    <div key={index} className={`message ${isOwnMessage ? 'sender' : ''}`} style={messageStyle}>
                      <p>{isOwnMessage ? "나: " : message.sender + ": "}{message.content}</p>
                    </div>
                  );
                })}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="메시지 입력..."
              />
              <button onClick={handleSendMessage}>전송</button>
            </div>
          ) : (
            <p>채팅방을 선택하세요.</p>
          )}
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default ChatApp;