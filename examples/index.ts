
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

const user = await User.find(client, 1);

console.log(user);