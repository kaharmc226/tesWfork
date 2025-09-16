import React, { useCallback, useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [testStatus, setTestStatus] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const testSendToSheet = useCallback(async () => {
    setIsTesting(true);
    setTestStatus('Mengirim data uji...');

    try {
      const timestamp = Date.now();
      const response = await fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: `Tes Spreadsheet ${timestamp}`,
          email: `tes+${timestamp}@example.com`,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengirim data uji');
      }

      const data = await response.json();
      setTestStatus(`Tes berhasil: ${data.message}, id: ${data.id}`);

      const refreshed = await fetch('/users');
      if (!refreshed.ok) {
        throw new Error('Gagal memuat ulang data users setelah tes');
      }

      const refreshedData = await refreshed.json();
      setUsers(refreshedData);
    } catch (error) {
      setTestStatus(`Tes gagal: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  }, [setIsTesting, setTestStatus, setUsers]);

  useEffect(() => {
    fetch('/hello')
      .then(response => response.text())
      .then(data => setMessage(data))
      .catch(err => console.error('Error fetching:', err));
  }, []);

  useEffect(() => {
    fetch('/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  const shouldAutoTest = process.env.REACT_APP_AUTO_TEST_SPREADSHEET === 'true';

  useEffect(() => {
    if (shouldAutoTest) {
      testSendToSheet();
    }
  }, [shouldAutoTest, testSendToSheet]);

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama, email }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Gagal menambahkan user');
        return res.json();
      })
      .then(data => {
        setResponseMessage(`Sukses: ${data.message}, id: ${data.id}`);
        setNama('');
        setEmail('');
        return fetch('/users')
          .then(res => res.json())
          .then(data => setUsers(data));
      })
      .catch(err => setResponseMessage(`Error: ${err.message}`));
  };

  return (
    <div>
      <h1>Response dari backend</h1>
      <p>{message}</p>

      <h2>Tambah User</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={nama}
          placeholder="nama"
          onChange={e => setNama(e.target.value)}
          required
        />
        <input
          type="email"
          value={email}
          placeholder="email"
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">Tambah</button>
      </form>

      <p>{responseMessage}</p>
      <button type="button" onClick={testSendToSheet} disabled={isTesting}>
        {isTesting ? 'Mengirim data uji...' : 'Test Spreadsheet'}
      </button>
      {testStatus && <p>{testStatus}</p>}

      <h2>Daftar User</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.nama} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
