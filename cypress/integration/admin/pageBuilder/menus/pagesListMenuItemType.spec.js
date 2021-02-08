describe("Menus Module", () => {
    // Not generating unique IDs because of Cypress' multiple super domains issue. Once we change the domain,
    // this code gets executed again, meaning we get a different unique ID. This is also the reason why the
    // test below is broken into multiple steps.
    const id = Cypress.env("TEST_RUN_ID");
    const idEdited = `X-${id}-Y`;

    beforeEach(() => cy.login());

    it(`Step 1: create a pages list menu item in the "Main Menu" menu`, () => {
        for (let i = 0; i < 3; i++) {
            // eslint-disable-next-line
            cy.pbCreatePage({ category: "static" }).then(page => {
                cy.pbUpdatePage({
                    id: page.id,
                    data: {
                        title: `Page-${id}-${i}`,
                        settings: {
                            general: {
                                tags: [`page-${id}`, `page-${id}-${i}`]
                            }
                        }
                    }
                });
                cy.pbPublishPage({ id: page.id });
            });
        }

        cy.visit("/page-builder/menus");

        cy.wait(500);
        cy.findByTestId("default-data-list").within(() => {
            cy.findByText("Main Menu").click();
        });

        // Test "Page List".
        cy.findByText(/\+ Add Menu Item/i).click();
        cy.findByText("Page list").click();
        cy.findByLabelText("Title").type(id);
        cy.findByText(/Save Menu Item/i)
            .click()
            .wait(200);
        cy.findByText("Value is required.").should("exist");
        cy.findByLabelText("Category").type(`Static`);
        cy.findByText("Static").click();
        cy.findByText("Sort by...")
            .prev()
            .select("Title");
        cy.findByText("Sort direction...")
            .prev()
            .select("Descending");

        cy.findByLabelText("Tags").type(`page-${id}-`);
        cy.findByText(`page-${id}-0`).click();

        cy.findByLabelText("Tags").type(`page-${id}-`);
        cy.findByText(`page-${id}-1`).click();

        cy.findByLabelText("Tags").type(`some-custom-tag`);
        cy.findByText(`some-custom-tag`).click();
        cy.findByText("Tags rule...")
            .prev()
            .select("Must include any of the tags");

        cy.findByText(/Save Menu Item/i).click();
        cy.findByText("Save menu").click();
        cy.findByText("Menu saved successfully.");
    });

    it(`Step 2: assert that menu item and pages are shown (descending order)`, () => {
        cy.visit(Cypress.env("WEBSITE_URL"));
        cy.reloadUntil(() => {
            // We wait until the document contains the newly added menu.
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(Cypress.$(`:contains(${id})`).length > 0);
                    console.log(
                        `Cypress.$(\`:contains(${id})\`).length > 0`,
                        Cypress.$(`:contains(${id})`).length
                    );
                }, 5000);
            });
        })
            .findByTestId("pb-desktop-header")
            .within(() => {
                // Let's check the links and the order.
                cy.findByText(id).within(() => {
                    cy.get("ul li:nth-child(1)").contains(`Page-${id}-1`);
                    cy.get("ul li:nth-child(2)").contains(`Page-${id}-0`);
                });
            });
    });

    it(`Step 3: change the order of pages`, () => {
        cy.visit("/page-builder/menus");

        cy.findByTestId("default-data-list").within(() => {
            cy.findByText(`Main Menu`).click({ force: true });
        });

        cy.findByTestId(`pb-menu-item-render-${id}`).within(() => {
            cy.findByTestId("pb-edit-icon-button").click();
        });

        cy.findByText("Sort direction...")
            .prev()
            .select("Ascending");
        cy.findByLabelText("Title")
            .clear()
            .type(idEdited);

        cy.findByText(/Save Menu Item/i).click();
        cy.findByText("Save menu").click();
        cy.findByText("Menu saved successfully.").should("exist");
    });

    it(`Step 4: assert that menu item and pages are shown (ascending order)`, () => {
        cy.visit(Cypress.env("WEBSITE_URL"))
            .reloadUntil(() => {
                // We wait until the document contains the newly added menu.
                return new Promise(resolve => {
                    setTimeout(() => resolve(Cypress.$(`:contains(${idEdited})`).length > 0), 5000);
                });
            })
            .findByTestId("pb-desktop-header")
            .within(() => {
                // Let's check the links and the order.
                cy.findByText(idEdited).within(() => {
                    cy.get("ul li:nth-child(1)").contains(`Page-${id}-0`);
                    cy.get("ul li:nth-child(2)").contains(`Page-${id}-1`);
                });
            });
    });

    it(`Step 5: delete the newly added pages list menu item`, () => {
        cy.visit("/page-builder/menus");

        cy.findByTestId("default-data-list").within(() => {
            cy.findByText(`Main Menu`).click({ force: true });
        });

        cy.findByTestId(`pb-menu-item-render-${idEdited}`).within(() => {
            cy.findByTestId("pb-delete-icon-button").click();
        });

        cy.findByText("Save menu").click();
        cy.findByText("Menu saved successfully.").should("exist");
    });

    it(`Step 6: assert that the pages list menu item does not exist`, () => {
        cy.visit(Cypress.env("WEBSITE_URL"))
            .reloadUntil(() => {
                // We wait until the document contains the newly added menu.
                return new Promise(resolve => {
                    setTimeout(
                        () => resolve(Cypress.$(`:contains(${idEdited})`).length === 0),
                        5000
                    );
                });
            })
            .findByTestId("pb-desktop-header")
            .within(() => {
                // Let's check the links and the order.
                cy.findByText(idEdited).should("not.exist");
            });
    });
});
