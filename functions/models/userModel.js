const { db } = require("../config/firebase");

// Add a new user
const addUser = async (data) => {
  try {
    const docRef = await db.collection("users").add(data);
    return { id: docRef.id, ...data };
  } catch (error) {
    throw new Error(`Error adding user: ${error.message}`);
  }
};

// Get all users
const getUsers = async () => {
  try {
    const snapshot = await db.collection("users").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Error retrieving users: ${error.message}`);
  }
};

// Get a single user by ID
const getUserById = async (id) => {
  try {
    const doc = await db.collection("users").doc(id).get();
    if (!doc.exists) throw new Error("User not found");
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    throw new Error(`Error retrieving user: ${error.message}`);
  }
};

// Update a user
const updateUser = async (id, data) => {
  try {
    await db.collection("users").doc(id).update(data);
    return `User ${id} updated successfully`;
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};

// Delete a user
const deleteUser = async (id) => {
  try {
    await db.collection("users").doc(id).delete();
    return `User ${id} deleted successfully`;
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};

module.exports = { addUser, getUsers, getUserById, updateUser, deleteUser };
