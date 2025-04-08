module.exports = {
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sss|styl)$": "identity-obj-proxy",
  },
  moduleDirectories: ["node_modules", "src"], // Ensure Jest can resolve your modules
};
