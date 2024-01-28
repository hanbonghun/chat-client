// ChatRoomList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ChatRoomList({ username }) {
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/chatrooms?username=${username}`)
      .then((response) => {
        if (response.status === 200) {
            console.log(response.data)
          setChatRooms(response.data);
        } else {
          console.error('채팅방 목록을 불러오는 중 오류가 발생했습니다.');
        }
      })
      .catch((error) => {
        console.error('채팅방 목록을 불러오는 중 오류가 발생했습니다.', error);
      });
  }, [username]);

  return (
    <div>
      <h2>나의 채팅방 목록</h2>
      <ul>
        {chatRooms.map((chatRoom) => (
          <li key={chatRoom.id}>{chatRoom.id}</li>
        ))}
      </ul>
    </div>
  );
}

export default ChatRoomList;