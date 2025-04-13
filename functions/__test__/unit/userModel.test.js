// userModel.test.js
const { addUser, getUsers, getUserById, updateUser, deleteUser } = require("../../models/userModel");
const { db } = require("../../config/firebase");

// --- Mocks ---
// We override the Firestore "db" methods to simulate our collection and document behavior.
jest.mock("../../config/firebase", () => ({
  db: {
    collection: jest.fn(),
  },
}));

// Reset mocks before each test.
beforeEach(() => {
  jest.clearAllMocks();
});

//
// ===== addUser Tests =====
//
describe("addUser", () => {
  test("should add a new user successfully", async () => {
    // Arrange: define sample user data.
    const userData = {
      name: "John Doe",
      email: "john@example.com",
    };

    // Simulate a successful Firestore add operation.  
    // The add() call should resolve with a fake document reference having an id.
    const fakeDocRef = { id: "user123" };
    const addMock = jest.fn().mockResolvedValue(fakeDocRef);
    // When the code calls db.collection("users"), return an object with the add() method.
    db.collection.mockReturnValue({ add: addMock });

    // Act
    const result = await addUser(userData);

    // Assert: the add() method was called with the user data and the resolved value contains the id.
    expect(addMock).toHaveBeenCalledWith(userData);
    expect(result).toEqual({ id: "user123", ...userData });
  });

  test("should throw an error if adding the user fails", async () => {
    // Arrange
    const userData = {
      name: "Jane Doe",
      email: "jane@example.com",
    };
    const errorMessage = "Add failed";
    const addMock = jest.fn().mockRejectedValue(new Error(errorMessage));
    db.collection.mockReturnValue({ add: addMock });

    // Act & Assert
    await expect(addUser(userData)).rejects.toThrow(`Error adding user: ${errorMessage}`);
  });
});

//
// ===== getUsers Tests =====
//
describe("getUsers", () => {
  test("should return all users", async () => {
    // Arrange
    // Create fake documents that simulate Firestore snapshot.docs.
    const fakeDocs = [
      { id: "user1", data: () => ({ name: "User One", email: "user1@example.com" }) },
      { id: "user2", data: () => ({ name: "User Two", email: "user2@example.com" }) },
    ];
    const getMock = jest.fn().mockResolvedValue({ docs: fakeDocs });
    db.collection.mockReturnValue({ get: getMock });

    // Act
    const result = await getUsers();

    // Assert
    expect(getMock).toHaveBeenCalled();
    expect(result).toEqual([
      { id: "user1", name: "User One", email: "user1@example.com" },
      { id: "user2", name: "User Two", email: "user2@example.com" },
    ]);
  });

  test("should throw an error if fetching users fails", async () => {
    // Arrange
    const errorMessage = "Fetch error";
    const getMock = jest.fn().mockRejectedValue(new Error(errorMessage));
    db.collection.mockReturnValue({ get: getMock });

    // Act & Assert
    await expect(getUsers()).rejects.toThrow(`Error retrieving users: ${errorMessage}`);
  });
});

//
// ===== getUserById Tests =====
//
describe("getUserById", () => {
  test("should return a user if found", async () => {
    // Arrange
    const userId = "user123";
    const fakeData = { name: "John Doe", email: "john@example.com" };
    const fakeDoc = { exists: true, id: userId, data: () => fakeData };
    const getMock = jest.fn().mockResolvedValue(fakeDoc);
    const docMock = jest.fn().mockReturnValue({ get: getMock });
    db.collection.mockReturnValue({ doc: docMock });

    // Act
    const result = await getUserById(userId);

    // Assert
    expect(docMock).toHaveBeenCalledWith(userId);
    expect(result).toEqual({ id: userId, ...fakeData });
  });

  test("should throw an error if user is not found", async () => {
    // Arrange
    const userId = "nonexistent";
    const fakeDoc = { exists: false };
    const getMock = jest.fn().mockResolvedValue(fakeDoc);
    const docMock = jest.fn().mockReturnValue({ get: getMock });
    db.collection.mockReturnValue({ doc: docMock });

    // Act & Assert
    await expect(getUserById(userId)).rejects.toThrow("User not found");
  });
});

//
// ===== updateUser Tests =====
//
describe("updateUser", () => {
  test("should update a user successfully", async () => {
    // Arrange
    const userId = "user123";
    const updatedData = { name: "Jane Doe" };

    // Simulate the update() operation on a document.
    const updateMock = jest.fn().mockResolvedValue();
    const docMock = jest.fn().mockReturnValue({ update: updateMock });
    db.collection.mockReturnValue({ doc: docMock });

    // Act
    const result = await updateUser(userId, updatedData);

    // Assert
    expect(docMock).toHaveBeenCalledWith(userId);
    expect(updateMock).toHaveBeenCalledWith(updatedData);
    expect(result).toBe(`User ${userId} updated successfully`);
  });

  test("should throw an error if update fails", async () => {
    // Arrange
    const userId = "user123";
    const updatedData = { name: "Jane Doe" };
    const errorMessage = "Update error";
    const updateMock = jest.fn().mockRejectedValue(new Error(errorMessage));
    const docMock = jest.fn().mockReturnValue({ update: updateMock });
    db.collection.mockReturnValue({ doc: docMock });

    // Act & Assert
    await expect(updateUser(userId, updatedData)).rejects.toThrow(`Error updating user: ${errorMessage}`);
  });
});

//
// ===== deleteUser Tests =====
//
describe("deleteUser", () => {
  test("should delete a user successfully", async () => {
    // Arrange
    const userId = "user123";
    const deleteMock = jest.fn().mockResolvedValue();
    const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
    db.collection.mockReturnValue({ doc: docMock });

    // Act
    const result = await deleteUser(userId);

    // Assert
    expect(docMock).toHaveBeenCalledWith(userId);
    expect(deleteMock).toHaveBeenCalled();
    expect(result).toBe(`User ${userId} deleted successfully`);
  });

  test("should throw an error if deleting fails", async () => {
    // Arrange
    const userId = "user123";
    const errorMessage = "Delete error";
    const deleteMock = jest.fn().mockRejectedValue(new Error(errorMessage));
    const docMock = jest.fn().mockReturnValue({ delete: deleteMock });
    db.collection.mockReturnValue({ doc: docMock });

    // Act & Assert
    await expect(deleteUser(userId)).rejects.toThrow(`Error deleting user: ${errorMessage}`);
  });
});
