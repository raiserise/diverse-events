const {
  addUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../models/userModel");
describe("User Model", () => {
  let testUserId;
  test("should add a user", async () => {
    const userData = { name: "John Doe", email: "john@example.com" };
    const user = await addUser(userData);
    expect(user).toHaveProperty("id");
    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("john@example.com");
    testUserId = user.id;
  });
  test("should get all users", async () => {
    const users = await getUsers();
    expect(Array.isArray(users)).toBe(true);
  });
  test("should get a user by ID", async () => {
    const user = await getUserById(testUserId);
    expect(user).toHaveProperty("id", testUserId);
  });
  test("should update a user", async () => {
    const updatedData = { name: "Updated User" };
    await updateUser(testUserId, updatedData);
    const updatedUser = await getUserById(testUserId);
    expect(updatedUser.name).toBe("Updated User");
  });
  test("should delete a user", async () => {
    await deleteUser(testUserId);
    await expect(getUserById(testUserId)).rejects.toThrow("User not found");
  });
});
