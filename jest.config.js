module.exports = {
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sss|styl)$": "identity-obj-proxy",
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/utils/**",
    "!src/api/apiService",
    "!src/layout/**",
    "!src/pages/landing/**",
    "!src/pages/login/**",
    "!src/pages/services/**",
  ],
  moduleDirectories: ["node_modules", "src"], // Ensure Jest can resolve your modules
};
