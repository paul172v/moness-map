export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)$":
      "<rootDir>/__mocks__/fileMock.js",
  },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!(@babel/runtime)/)"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
};
