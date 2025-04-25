import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Profile() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/me', { withCredentials: true })
      .then(res => {
        const userId = res.data.id; // l'id local !
        return axios.get(`http://localhost:5000/api/${userId}/certified`, {
          withCredentials: true
        });
      })
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);
  

  return (
    <div>
      <h2>Donnée "certified" :</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default Profile;
