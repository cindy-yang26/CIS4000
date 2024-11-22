## Examify

This project is a web application with a frontend built in React and a backend powered by Spring Boot. The frontend and backend are run separately, with the frontend handling the user interface and connecting to the backend for API calls.


### Prerequisites

Make sure you have the following installed:

- **Java 17 or higher** for the Spring Boot backend.
- **npm** (Node Package Manager) for the React frontend.
- **Maven** for dependency management and building the backend (can use `mvn` or the provided Maven Wrapper `mvnw`).

### Project Structure

```
Examify/
├── backend/           # Spring Boot backend code
└── frontend/          # React frontend code
```

### Running the Project

#### Running the Backend (Spring Boot)

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

2. **Install Dependencies and Build the Project**:
   - If you’re using the Maven Wrapper:
     ```bash
     ./mvnw clean install      # On Mac/Linux
     .\mvnw clean install      # On Windows
     ```
   - Or, if Maven is installed globally:
     ```bash
     mvn clean install
     ```

3. **Run the Backend Server**:
   ```bash
   ./mvnw spring-boot:run      # On Mac/Linux
   .\mvnw spring-boot:run      # On Windows
   ```
   - Or, with global Maven:
     ```bash
     mvn spring-boot:run
     ```

4. **Access the Backend**:
   - The backend server will start on `http://localhost:8080` by default.

#### Running the Frontend (React)

1. **Navigate to the Frontend Directory**:
   ```bash
   cd ../frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Frontend Development Server**:
   ```bash
   npm start
   ```

4. **Access the Frontend**:
   - The frontend development server will start on `http://localhost:3000` by default.

### Usage

Once both servers are running, you can access the application:

1. Open `http://localhost:3000` in your web browser to view the frontend.
2. The frontend will make API requests to the backend at `http://localhost:8080`.
