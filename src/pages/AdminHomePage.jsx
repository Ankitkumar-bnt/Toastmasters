import React, { useEffect, useState } from "react";
import { getAllMembers, addMember, updateMember, deleteUserById } from "../api/UserApi";
import AssignRole from "../components/assign-role/AssignRole";

function AdminHomePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    userName: "",
    userEmail: "",
    userContact: "",
    userPassword: "",
    address: "",
    gender: "",
    dob: "",
    hobbies: "",
    mentor: "" // store selected mentor's userId
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllMembers();
      setUsers(res.data.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // Map mentor selection to mentorId integer expected by backend
      const payload = { ...newUser };
      if (payload.mentor === "" || payload.mentor == null) {
        delete payload.mentor;
        delete payload.mentorId;
      } else {
        const mid = parseInt(payload.mentor, 10);
        payload.mentorId = mid;
        delete payload.mentor;
      }

      await addMember(payload);
      setNewUser({
        userName: "",
        userEmail: "",
        userContact: "",
        userPassword: "",
        address: "",
        gender: "",
        dob: "",
        hobbies: "",
        mentor: ""
      });
      loadUsers();
    } catch (err) {
      console.error("Add user failed:", err);
    }
  };

  const handleUpdate = async (user) => {
    try {
      await updateMember({
        ...user,
        userName: user.userName + " (Updated)" // Example update
      });
      loadUsers();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUserById(id);
      loadUsers();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (loading) return <h3>Loading members...</h3>;

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <AssignRole />

      <hr className="my-5" />

      <h2>Add New Member</h2>
      <form onSubmit={handleAddUser}>
        <input
          type="text"
          placeholder="Name"
          value={newUser.userName}
          onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.userEmail}
          onChange={(e) => setNewUser({ ...newUser, userEmail: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Contact"
          value={newUser.userContact}
          onChange={(e) => setNewUser({ ...newUser, userContact: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.userPassword}
          onChange={(e) => setNewUser({ ...newUser, userPassword: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Address"
          value={newUser.address}
          onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Gender (Male/Female/Other)"
          value={newUser.gender}
          onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
          required
        />
        <input
          type="date"
          value={newUser.dob}
          onChange={(e) => setNewUser({ ...newUser, dob: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Hobbies"
          value={newUser.hobbies}
          onChange={(e) => setNewUser({ ...newUser, hobbies: e.target.value })}
        />
        <input
          type="text"
          placeholder="Mentor (select below)"
          value={users.find((m) => Number(m.userId) === Number(newUser.mentor))?.userName || ""}
          readOnly
          style={{ backgroundColor: '#f8f9fa' }}
        />
        <select
          value={newUser.mentor}
          onChange={(e) => setNewUser({ ...newUser, mentor: e.target.value })}
        >
          <option value="">Select Mentor (optional)</option>
          {users.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.userId} {m.userName}
            </option>
          ))}
        </select>
        <button type="submit">Add Member</button>
      </form>

      <h2>Members List</h2>
      {users.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u.userId}>
              {u.userName} ({u.userEmail})
              {" "}
              <span style={{ color: '#6c757d' }}>
                • Mentor: {
                  // Prefer name from nested mentor object; fallback to lookup by id
                  u.mentor?.userName ||
                  users.find((m) => Number(m.userId) === Number(u.mentor?.userId || u.mentorId))?.userName ||
                  (u.mentor?.userId || u.mentorId ? `ID ${u.mentor?.userId || u.mentorId}` : 'None')
                }
              </span>
              <button onClick={() => handleUpdate(u)}>Update</button>
              <button onClick={() => handleDelete(u.userId)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminHomePage;
