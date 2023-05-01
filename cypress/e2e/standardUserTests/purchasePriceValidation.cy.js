import { productsPage } from "../../support/pageObjects/productsPageObjects.js";
import { checkoutPages } from "../../support/pageObjects/checkoutPageObjects.js";
import { cartPage } from "../../support/pageObjects/cartPageObjects.js";

//import setup from env json
//setup includes number of iterations and size of groups of items to add to cart (2 at a time, 3 at a time, etc.)
let items = Cypress.env("items");
let iterations = Cypress.env("iterations");
let names = {
  "items": [],
  "prices": []
};
//run a small loop to generate strings used as variable names (aliases)
for (let i = 0; i < items; i++) {
  names.items.push("item" + i);
  names.prices.push("price" + i);
}
//run the test suite for the number of iterations in the setup 
//each run it will generate different random numbers
for (let x = 1; x <= iterations; x++) {
  describe(`Validate prices in the checkout page iteration ${x}`, function () {

    beforeEach(() => {
      //call the login custom command that triggers the cy.session functionality
      cy.loginUser(Cypress.env("USERNAME"), Cypress.env("PASS"));
      //after a session is saved or retrieved, cypress requires the cy.visit command to be used
      cy.visit(Cypress.env("SERVER") + "inventory.html", {failOnStatusCode: false});
  
      //avoid unnecessary login or consulation creations by checking current url
      cy.get("body").then((body) => {
          //check if account is logged in
          if (body.find(productsPage.visitShopingCart).length = 0) {
              cy.loginUser(Cypress.env("USERNAME"), Cypress.env("PASS"));
              cy.visit(Cypress.env("SERVER") + "inventory.html", {failOnStatusCode: false})
          }
      });
    })
  
    after(() => {
      Cypress.session.clearAllSavedSessions();
    })
  
    it('Validate Price in checkout page', () => {
      cy.selectItems(names.items, names.prices);
      cy.get(productsPage.visitShopingCart).click();
      cy.get(cartPage.goToCheckout).click();
      cy.fillCheckoutInfo("Florea", "Micu", "123");
      cy.get(checkoutPages.goToCheckoutOverview).click().wait(300);
      cy.get("@prices").then(function($prices){
        for(let y = 0; y < $prices.length; y++) {
          cy.compareItemPrices(names.items.indexOf("item" + y), $prices[y]);
        }
        cy.checkSubtotal($prices);
      })

      cy.clearAppState();
    })
  })
}
