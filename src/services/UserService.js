import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; // 실제 서버 주소로 변경

export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};