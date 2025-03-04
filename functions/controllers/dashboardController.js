const getDashboardData = async (req, res) => {
  try {
    const [createdEvents, participatingEvents] = await Promise.all([
      eventModel.getEventsByUser(req.user.user_id),
      rsvpModel.getUserRSVPs(req.user.user_id),
    ]);

    res.status(200).json({
      createdEvents,
      participatingEvents,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
