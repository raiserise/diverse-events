const eventModel = require("../models/eventModel");

// Controller to handle adding a event
const addEvent = async (req, res) => {
  try {
    const data = req.body;
    const result = await eventModel.addEvent(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to get all events
const getEvents = async (req, res) => {
  try {
    const result = await eventModel.getEvents();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to get event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await eventModel.getEventById(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to update a event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await eventModel.updateEvent(id, data);
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to delete a event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await eventModel.deleteEvent(id);
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addEvent, getEvents, getEventById, updateEvent, deleteEvent };
