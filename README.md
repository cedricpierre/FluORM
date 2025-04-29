# FluORM

FluORM is a lightweight and flexible Object-Relational Mapping (ORM) library for TypeScript/JavaScript applications. It provides a simple and intuitive way to interact with your API endpoints while maintaining type safety and following object-oriented principles.

## Installation

```bash
npm install fluorm
```

Run tests

```bash
npm test
```

## Configuration

Before using FluORM, you need to configure it with your API base URL and optional interceptors:

```typescript
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
```

## Creating Models

Models are the core of FluORM. Here's how to create a model:

```typescript
import { Model, Attributes } from 'fluorm';

interface IUser extends Attributes {
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export class User extends Model<IUser> {
  static resource = 'users'; // The API endpoint for this model
}
```

## Decorators

FluORM provides several decorators to define relationships and type casting:

### Relationship Decorators

```typescript
import { HasOne, HasMany, BelongsTo, BelongsToMany } from 'fluorm';

class User extends Model<IUser> {
  @HasOne(() => Profile)
  declare profile: Relation<Profile>;

  @HasMany(() => Post)
  declare posts: Relation<Post[]>;

  @BelongsTo(() => Team)
  declare team: Relation<Team>;

  @BelongsToMany(() => Role)
  declare roles: Relation<Role[]>;
}
```

### Type Casting

```typescript
import { Cast } from 'fluorm';

class User extends Model<IUser> {
  @Cast(() => Date)
  created_at?: Date;

  @Cast(() => Thumbnail)
  thumbnail?: Thumbnail;

  @Cast(() => Thumbnail)
  thumbnails?: Thumbnail[];
}
```

## Scopes

Scopes allow you to define reusable query constraints:

```typescript
class User extends Model<IUser> {
  static scopes = {
    active: () => ({ status: 'active' }),
    verified: () => ({ email_verified: true }),
    // Custom scope with parameters
    ageRange: (min: number, max: number) => ({
      age: { $gte: min, $lte: max }
    })
  };
}
```

## Static Methods

Models come with several static methods for querying and manipulating data:

### Fetch methods

- `all()`: Get all records
- `find(id)`: Find a record by ID
- `create(data)`: Create a new record
- `update(id, data)`: Update a record
- `delete(id)`: Delete a record
- `firstOrCreate(where, createData)`: Find first record or create if not found
- `updateOrCreate(where, updateData)`: Update first record or create if not found

- `query()`: Start a new query builder
- `where(conditions)`: Add where conditions
- `filter(filters)`: Add filter conditions
- `include(relations)`: Include related models
- `id(id)`: Return a new instance with id.


Example usage:

```typescript
// Get all users
const users = await User.all();

// Find user by ID
const user = await User.find(1);

// Create new user
const newUser = await User.create({
  name: 'John Doe',
  email: 'john@example.com'
});

// Update user
await User.update(1, { name: 'Jane Doe' });

// Delete user
await User.delete(1);

// Query with conditions
const activeUsers = await User.where({ status: 'active' }).all();

// Include related models
const userWithPosts = await User.include('posts').find(1);

// Deep chaining
const thumbails = User.id(1).medias.id(2).thumnails.all();
// Will make a call to /users/1/medias/2/thumbails
```

## Instance Methods

Model instances have the following methods:

- `save()`: Create or update the record
- `update(data)`: Update the record
- `delete()`: Delete the record

Example usage:

```typescript
const user = new User({
  name: 'John Doe',
  email: 'john@example.com'
});

// Save new user
await user.save();

// Update user
user.name = 'Jane Doe';
await user.update();

// Delete user
await user.delete();
```

## Additional Methods

### toObject()

The `toObject()` method converts a model instance and its related models into a plain JavaScript object:

```typescript
const user = await User.find(1);
const userObject = user.toObject();
// Returns a plain object with all properties and nested related models
```

## Error Handling

FluORM includes comprehensive error handling for common scenarios:

- Missing required parameters (ID, data, where conditions)
- Undefined resource names
- API request failures
- Invalid model operations

Example error handling:

```typescript
try {
  const user = await User.find(1);
} catch (error) {
  if (error instanceof Error) {
    console.error(`Failed to find user: ${error.message}`);
  }
}

try {
  await User.update(1, { name: 'John' });
} catch (error) {
  if (error instanceof Error) {
    console.error(`Failed to update user: ${error.message}`);
  }
}
```

## License

MIT
