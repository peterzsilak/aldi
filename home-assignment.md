# Homework Assignment for Quality Assurance Engineer Position

## Instructions
Please complete the tasks below and submit your responses. Each task is designed to gauge your technical skills and methodologies in quality assurance.

---

## Task 1: Manual Testing
**Scenario:** You are given the ALDI US website (`aldi.us`) where users can browse products and create shopping lists.

* **Test Case Creation:** Write three test cases for the "Add to Shopping List" feature on the website, focusing on both positive and negative scenarios, define the fields that you feel necessary for the test cases.
    * **Test Case 1:** Add a single product to the shopping list
    * **Test Case 2:** Attempt to add a product without being logged in
    * **Test Case 3:** Add multiple products and verify the shopping list
* **Bug Reporting:** Describe a potential bug you might encounter while testing the "Add to Shopping List" feature, and provide a sample bug report and define the fields that you feel necessary for the bug.

---

## Task 2: Frontend Testing
**Scenario:** You are testing a web application built using Angular.

* **Testing Framework:** Implement executable end-to-end tests using Playwright for the "Login" feature. Include:
    * Setup steps for the testing framework.
    * A test script for the "Login" functionality, checking for successful login and handling failures (invalid password).

---

## Task 3: API Testing
**Scenario:** You are tasked with testing a RESTful API that provides task management services.

* **API Testing Framework:** Using Playwright, create a test suite for the following endpoints:
    * `POST /tasks` - Create a new task.
    * `GET /tasks/{id}` - Retrieve a task by ID.
    * `PUT /tasks/{id}` - Update a task by ID.
    * `DELETE /tasks/{id}` - Delete a task by ID.
* Provide sample code for each endpoint testing, and outline the expected status codes and responses.

---

## Bonus Questions
* **Docker:** Explain what Docker is and how it can be beneficial for a QA engineer. Provide a simple example of how you would set up an automated testing environment using Docker.
* **JUnit + Selenium:** Describe how you would use Selenium and JUnit for automating the testing of the "Delete Task" feature in the web application. Include a brief sample of the test code you would write.
* **CI Integration:** Explain how you would integrate your tests into a Continuous Integration (CI) pipeline. Which tools and processes would you utilize to ensure that tests are automatically run on each code commit or pull request? Provide an example of a CI tool you have used or are familiar with.