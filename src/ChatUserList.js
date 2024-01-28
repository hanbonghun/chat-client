import React from 'react';

function ChatUserList({ users, onUserClick }) {
  return (
    <div>
      <h2>사용자 목록</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name}
            <button onClick={() => onUserClick(user.name)}>1:1 대화하기</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatUserList;