import React from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_USERS = gql`
  query {
    users {
      username
      email
      password
      user_address
    }
  }
`;

function UserList() {
  const { loading, error, data } = useQuery(GET_USERS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {data.users.map(user => (
          <li key={user.user_id}>
            <strong>Username:</strong> {user.username}<br />
            <strong>Email:</strong> {user.email}<br />
            <strong>Password:</strong> {user.password}<br />
            <strong>Address:</strong> {user.user_address}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;