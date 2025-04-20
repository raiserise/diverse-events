// userController.test.js
const userController = require("../../controllers/userController");

// Mock the dependent model methods
jest.mock("../../models/userModel", () => ({
  addUser: jest.fn(),
  getUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  getUsersByIds: jest.fn(),
}));

const userModel = require("../../models/userModel");

// Helper: create a fake Express response object.
const createFakeRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

beforeEach(() => {
  jest.clearAllMocks();
});

//
// ===== addUser Tests =====
//
describe("addUser", () => {
  test("should add a new user and return 201 with the user data", async () => {
    // Arrange
    const req = {
      body: { name: "John Doe", email: "john@example.com" },
    };
    const res = createFakeRes();

    const fakeUser = {
      id: "user123",
      name: "John Doe",
      email: "john@example.com",
    };
    userModel.addUser.mockResolvedValue(fakeUser);

    // Act
    await userController.addUser(req, res);

    // Assert
    expect(userModel.addUser).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  test("should return 500 with error message if adding user fails", async () => {
    // Arrange
    const req = {
      body: { name: "Jane Doe", email: "jane@example.com" },
    };
    const res = createFakeRes();
    const errorMessage = "Add user failed";
    userModel.addUser.mockRejectedValue(new Error(errorMessage));

    // Act
    await userController.addUser(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});

//
// ===== getUsers Tests =====
//
describe("getUsers", () => {
  test("should return all users with a 200 status", async () => {
    // Arrange
    const req = {};
    const res = createFakeRes();
    const fakeUsers = [
      { id: "user1", name: "User One" },
      { id: "user2", name: "User Two" },
    ];
    userModel.getUsers.mockResolvedValue(fakeUsers);

    // Act
    await userController.getUsers(req, res);

    // Assert
    expect(userModel.getUsers).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeUsers);
  });

  test("should return 500 with error message if fetching users fails", async () => {
    // Arrange
    const req = {};
    const res = createFakeRes();
    const errorMessage = "Error retrieving users";
    userModel.getUsers.mockRejectedValue(new Error(errorMessage));

    // Act
    await userController.getUsers(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});

//
// ===== getUserById Tests =====
//
describe("getUserById", () => {
  test("should return user details with a 200 status", async () => {
    // Arrange
    const req = { params: { id: "user123" } };
    const res = createFakeRes();
    const fakeUser = {
      id: "user123",
      name: "John Doe",
      email: "john@example.com",
    };
    userModel.getUserById.mockResolvedValue(fakeUser);

    // Act
    await userController.getUserById(req, res);

    // Assert
    expect(userModel.getUserById).toHaveBeenCalledWith("user123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  test("should return 500 if fetching user by id fails", async () => {
    // Arrange
    const req = { params: { id: "user123" } };
    const res = createFakeRes();
    const errorMessage = "User not found";
    userModel.getUserById.mockRejectedValue(new Error(errorMessage));

    // Act
    await userController.getUserById(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});

//
// ===== updateUser Tests =====
//
describe("updateUser", () => {
  test("should update a user and return 200 with success message", async () => {
    // Arrange
    const req = { params: { id: "user123" }, body: { name: "Jane Doe" } };
    const res = createFakeRes();
    const successMessage = `User user123 updated successfully`;
    userModel.updateUser.mockResolvedValue(successMessage);

    // Act
    await userController.updateUser(req, res);

    // Assert
    expect(userModel.updateUser).toHaveBeenCalledWith("user123", req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: successMessage });
  });

  test("should return 500 with error message if update fails", async () => {
    // Arrange
    const req = {
      params: { id: "user123" },
      body: { email: "jane@example.com" },
    };
    const res = createFakeRes();
    const errorMessage = "Update failed";
    userModel.updateUser.mockRejectedValue(new Error(errorMessage));

    // Act
    await userController.updateUser(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});

//
// ===== deleteUser Tests =====
//
describe("deleteUser", () => {
  test("should delete a user and return 200 with success message", async () => {
    // Arrange
    const req = { params: { id: "user123" } };
    const res = createFakeRes();
    const successMessage = `User user123 deleted successfully`;
    userModel.deleteUser.mockResolvedValue(successMessage);

    // Act
    await userController.deleteUser(req, res);

    // Assert
    expect(userModel.deleteUser).toHaveBeenCalledWith("user123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: successMessage });
  });

  test("should return 500 with error message if deleting user fails", async () => {
    // Arrange
    const req = { params: { id: "user123" } };
    const res = createFakeRes();
    const errorMessage = "Delete failed";
    userModel.deleteUser.mockRejectedValue(new Error(errorMessage));

    // Act
    await userController.deleteUser(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});

// ===== getUsersByIds Tests =====
describe("getUsersByIds", () => {
  test("should return users for valid ids with a 200 status", async () => {
    // Arrange
    const req = { body: { ids: ["user123", "user456"] } };
    const res = createFakeRes();
    const fakeUsers = [
      { id: "user123", name: "John Doe" },
      { id: "user456", name: "Jane Doe" },
    ];
    userModel.getUsersByIds.mockResolvedValue(fakeUsers);

    // Act
    await userController.getUsersByIds(req, res);

    // Assert
    expect(userModel.getUsersByIds).toHaveBeenCalledWith([
      "user123",
      "user456",
    ]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ users: fakeUsers });
  });

  test("should return 400 if ids is not an array", async () => {
    // Arrange
    const req = { body: { ids: "not-an-array" } }; // Invalid input
    const res = createFakeRes();

    // Act
    await userController.getUsersByIds(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "ids must be a non-empty array",
    });
  });

  test("should return 400 if ids is an empty array", async () => {
    // Arrange
    const req = { body: { ids: [] } }; // Empty array
    const res = createFakeRes();

    // Act
    await userController.getUsersByIds(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "ids must be a non-empty array",
    });
  });

  test("should return 500 if there is a database error", async () => {
    // Arrange
    const req = { body: { ids: ["user123", "user456"] } };
    const res = createFakeRes();
    const errorMessage = "Database error";
    userModel.getUsersByIds.mockRejectedValue(new Error(errorMessage));

    // Act
    await userController.getUsersByIds(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});
