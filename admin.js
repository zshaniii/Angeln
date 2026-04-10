async function loadUsers() {
  const res = await fetch(`${API_URL}/admin/users`, {
    headers: {
      Authorization: "Bearer " + getToken()
    }
  });

  if (!res.ok) {
    alert("Kein Admin-Zugriff");
    return;
  }

  const users = await res.json();
  console.table(users);
}
