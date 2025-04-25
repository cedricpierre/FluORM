// Import specific components
import { FluORM } from 'fluorm';

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