// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import { checkoutPages } from "./pageObjects/checkoutPageObjects.js";
import { logout, clearState } from "./pageObjects/dashboardPageObjects.js";
import { login } from "./pageObjects/loginPageObjects.js";
import { productsPage } from "./pageObjects/productsPageObjects.js";

//perform a login action
Cypress.Commands.add("loginUser", function(username, password) {
    cy.session([username, password], () => {
        cy.visit(Cypress.env("SERVER"));
        cy.get(login.usernameField).click().clear().type(username);
        cy.get(login.passwordField).click().clear().type(password);
        cy.get(login.loginButton).click();
        cy.url().should("include", "inventory.html");
    });
})

//perform a logout action
Cypress.Commands.add("logout", function(){
    cy.get(logout.burgerMenu).click();
    cy.get(logout.logoutButton).click();
})

//command to select random items from products page
//items and prices are arrays of strings used as aliases names to store values
Cypress.Commands.add("selectItems", function(items, prices){
    let listOfPrices = [];
    cy.clearLocalStorage('cart-contents')
    //loop to generate random idexes and add corresponding items to cart
    for (let i = 0; i < items.length; i++) {
        if (i === 0) {
            cy.pickUpItem([], items[i]);                   //generate random number and store it in cypress alias
            cy.get('@' + items[i]).then((value) => {
                //retrieve generated random number and use it as index to add corresponding item to cart
                cy.addItemToCart(value, prices[i]);        //save added item's price
                cy.get('@' + prices[i]).then((price) => {
                    //retrieve added item's price and push it to listOfPrices array
                    listOfPrices.push(price);
                })
            })
        } else {
            //push existing generated number into an array to make sure newly generated number will be unique
            let indexes = [];
            for (let x = 0; x < i; x++) {
                cy.get('@' + items[x]).then((value) => {
                    indexes.push(value);
                })
            }
            cy.pickUpItem(indexes, items[i]);              //generate random number and store it in cypress alias
            cy.get('@' + items[i]).then((value) => {
                cy.addItemToCart(value, prices[i]);        //save added item's price
                cy.get('@' + prices[i]).then((price) => {
                    //retrieve added item's price and push it to listOfPrices array
                    listOfPrices.push(price);
                })
            })
        }
    }
    cy.wrap(listOfPrices).as("prices");
})

//command to pick up a random unique item from the list and store its index 
//indexes argument is an array of numbers already generated
//customName argument is a string used by the method as alias to store the index
Cypress.Commands.add("pickUpItem", function (indexes = [], customName){
    cy.get(productsPage.addToCartButton).then((elems) => {
        //method returns a single random number
        //assertion below throws an error if the method is called with an array larger than the available list of items
        expect(indexes.length).to.be.lessThan(elems.length);		

        if (indexes.length === 0) {
            //case when no index was generated and saved
            let num = Math.floor(Math.random() * elems.length);
            cy.wrap(num).as(customName)
        } else {
            //case when at least one index was already generated and saved
            (function generateRandom(exception) {
                let num = Math.floor(Math.random() * elems.length);
                if (exception.includes(num)) {
                    generateRandom(exception);			//function calls itself until a unique number is generated
                } else {
                    cy.wrap(num).as(customName)
                }
            })(indexes);
        }
    })
});

//command to add an item to the cart
//index argument is passed to select the desired item
//customName argument is a string used by the method as alias to store the price
Cypress.Commands.add("addItemToCart", function(index, customName){
    cy.get(productsPage.inventoryItemCard).eq(index).then((elem) => {
        cy.wrap(elem).find(productsPage.addToCartButton).click()
        cy.wrap(elem).find(productsPage.itemPrice).invoke('text').then((text) => {
            let value = text.substring(text.indexOf('$') + 1);
            cy.wrap(value).as(customName)    //store price
        })
    })
});

//command to fill in the checkout information
Cypress.Commands.add("fillCheckoutInfo", function(firstName, lastName, postalCode){
    cy.get(checkoutPages.firstNameField).clear().type(firstName);
    cy.get(checkoutPages.lastNameField).clear().type(lastName);
    cy.get(checkoutPages.postalCodeField).clear().type(postalCode);
})


//command to compare prices from products page with prices from checkout page
//index argument is used to pick items in the same order
//price argument represents the price from the products page
Cypress.Commands.add("compareItemPrices", function(index, price){
    cy.get(checkoutPages.itemPrice).eq(index).invoke('text').then((text) => {
        let value = text.substring(text.indexOf('$') + 1);
        cy.wrap(value).should('equal', price)
    })
});

//command to compare subtotal with sum of prices from checkout page
//prices argument is a array of prices stored from products page
Cypress.Commands.add("checkSubtotal", function(prices){
    cy.get(checkoutPages.subtotalPrice).invoke('text').then((text) => {
        //add all prices
        let sum = 0;
        for (let i in prices) {
            sum = sum + parseFloat(prices[i]);
        }
        //check that the sum of the prices equals the subtotal value
        let value = text.substring(text.indexOf('$') + 1);
        cy.wrap(value).should("equal", sum.toFixed(2).toString())
    })
});

//command to clear app state between test cases
Cypress.Commands.add("clearAppState", function(){
    cy.get(clearState.cancelCheckout).click();
    cy.get(logout.burgerMenu).click();
    cy.get(clearState.resetButton).click();
    cy.get(clearState.closeBurger).click();
})