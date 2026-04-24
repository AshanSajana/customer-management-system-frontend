#  Customer Management System

A full-stack **Customer Management System** built with **Spring Boot** (backend) and **React** (frontend).  
This application supports efficient customer data handling, including **high-performance Excel bulk uploads** using streaming techniques.

---

##  Features

-  Add, update, delete customers
-  Bulk upload customers via Excel
-  High-performance processing using Alibaba EasyExcel
-  RESTful API with Spring Boot
-  Responsive frontend with React
-  MySQL/MariaDB database integration

---

##  Tech Stack

### Backend
- Java 8
- Spring Boot
- Spring Data JPA
- Maven
- MySQL / MariaDB
- Alibaba EasyExcel

### Frontend
- React.js
- Axios
- HTML, CSS, JavaScript

---

##  Project Structure

```
Customer-Management-System/
│
├── backend/
├── frontend/
└── README.md
```

---

##  Getting Started

> **Note**: Make sure you have completed the installation of Java 8, Node.js, and MariaDB before proceeding.
---

##  Step 1: Database Setup

First, you will need to prepare your database environment.
1. Open your database tool.
2. Create a new database:

```sql
CREATE DATABASE customer_db;
```

Update:
```
backend/src/main/resources/application.properties
```
update your database username and password.


##  Step 2: Start the Backend (Spring Boot)

To start the Java server, open a terminal window in the backend folder:

```bash
cd backend
mvn clean install
mvn spring-boot:run
```
If the server starts correctly, the API will be available at http://localhost:8080.

---

##  Step 3: Start the Frontend (React)

With the backend running, open a new terminal window in the frontend folder 

```bash
cd frontend
npm install
npm start
```
If everything is set up correctly, your browser will automatically open http://localhost:3000 showing the Customer Management System.

---

##  Bulk Upload

Now that the app is running, you can test the Advanced Excel Upload:

- Name
- DOB
- NIC
- Mobiles
- Addresses

Use the Bulk Upload panel at the top of the web page.

---

## More..

- Modify the UI: Open frontend/src/App.js to change the styling or layout.
- Expand the API: Open backend/src/main/java/.../CustomerController.java to add new endpoints.
- Learn More: Check out the [Spring Boot Docs](https://spring.io/projects/spring-boot) or [React Docs](https://react.dev/)

---

##  Troubleshooting

If you encounter a 500 Error during upload, check the IntelliJ console for DateTimeParseException. Ensure your Excel dates are in YYYY-MM-DD or YYYY/MM/DD format.

---



