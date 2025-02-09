const userModel = require("../models/userModel");

// Controller to handle adding a user
const addUser = async (req, res) => {
  try {
    const data = req.body;
    const result = await userModel.addUser(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to get all users
const getUsers = async (req, res) => {
  try {
    const result = await userModel.getUsers();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userModel.getUserById(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to update a user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await userModel.updateUser(id, data);
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userModel.deleteUser(id);
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addUser, getUsers, getUserById, updateUser, deleteUser };
