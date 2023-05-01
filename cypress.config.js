import { defineConfig } from "cypress";

export default defineConfig({
  pageLoadTimeout: 25000,
  viewportWidth: 1920,
  viewportHeight: 1080,
  modifyObstructiveCode: false,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      SERVER: "https://www.saucedemo.com/",
      USERNAME: "standard_user",
      PASS: "secret_sauce",
      LOCKEDUSER: "locked_out_user",
      items: 2,
      iterations: 10
    },
    XHRLogs: true,
    allure: false,
    video: false,
    chromeWebSecurity: false,
    retries: {
    "runMode": 0,
    "openMode": 0
    },
    requestTimeout: 30000,
    responseTimeout: 15000,
    defaultCommandTimeout: 10000,
    specPattern: ["cypress/e2e/*/*spec.js", "cypress/e2e/*/*cy.js"],
    supportFile: "cypress/support/commands.js",
    supportFile: "cypress/support/index.js",
    supportFile: "cypress/support/e2e.js",
    experimentalSessionAndOrigin: true,
    watchForFileChanges: false,
    numTestsKeptInMemory: 15,
    waitForAnimations: true
  },
});
