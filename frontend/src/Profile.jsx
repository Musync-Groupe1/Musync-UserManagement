import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Profile() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/me', {
      withCredentials: true
    })
      .then(res => {
        const userId = res.data.id;
        return axios.get(`http://localhost:5000/api/${userId}/certified`, {
          withCredentials: true
        });
      })
      .then(res => {
        setData(res.data);
        console.log("✅ Données récupérées :", res.data);
      })
      .catch(err => {
        console.error("❌ Erreur lors de l'appel /me ou /certified :", err);
        if (err.response) {
          console.error("Status :", err.response.status);
          console.error("Data :", err.response.data);
        }
      });
  }, []);

  return (
    <div>
      <h2>✅ Donnée "certified" :</h2>
      <pre>{data ? JSON.stringify(data, null, 2) : <span style={{ color: 'red' }}>Échec de la récupération des données.</span>}</pre>
    </div>
  );
}

export default Profile;
