/*
* Example usage of the User model
* Demonstrates basic CRUD operations
*/
import ApiClient from "../ApiClient";
import User from "./user/User";
/*
* Initialize the client
*/
const client = new ApiClient({
    headers: {
        "X-CSRF-TOKEN": "your_csrf_token",
        "X-XSRF-TOKEN": "your_xsrf_token",
    },
});
ApiClient.baseUrl = "http://localhost:8000/api";
console.log("coucou");
/*
* Create a new user
*/
client.from(User).post({
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password",
});
/*
* Get all users
*/
client.from(User).get();
/*
* Update a user
*/
client.from(User).put({
    name: "John Doe",
});
/*
* Find a user
*/
const user = User.find(client, 1);
