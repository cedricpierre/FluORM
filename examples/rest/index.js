import { FluORM, Model } from 'fluorm';

FluORM.configure({
  baseUrl: 'https://api.example.com',
  // Optional interceptors
  requestInterceptor: (request) => {
    // Modify request before sending
    return request;
  },
  responseInterceptor: (response) => {
    // Modify response before returning
    return response;
  },
  errorInterceptor: (error) => {
    // Handle errors
    console.error(error);
  }
});

export class User extends Model {
  static resource = 'users'; // The API endpoint for this model
}

const user = new User({ id: 1, name: 'John Doe' });
user.save();
console.log(user);