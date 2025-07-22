# Hotel Management System - Backend API

A comprehensive NestJS-based backend API for hotel management with real-time features, payment processing, and role-based access control.

## 🚀 Features

### ✅ Completed Features
- **User Authentication & Authorization** with JWT
- **Role-based Access Control** (User, Kitchen, Delivery, Admin)
- **Staff Registration** (Kitchen/Delivery endpoints)
- **Input Validation** with class-validator DTOs
- **Comprehensive Error Handling** with global exception filter
- **Stripe Payment Integration** with webhook support
- **Admin Panel** with business analytics and management
- **Real-time Notifications** with Socket.IO
- **Production-ready Security** (Helmet, Rate limiting, CORS)
- **Order Management** with status tracking
- **Payment Analytics** and reporting
- **Staff Management** system
- **System Health** monitoring

### 🛠 Technology Stack
- **Framework**: NestJS (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport
- **Payment**: Stripe API
- **Real-time**: Socket.IO
- **Validation**: class-validator, class-transformer
- **Security**: Helmet, CORS, Rate Limiting
- **Documentation**: Built-in NestJS documentation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Stripe account (for payments)

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd backend

# Install dependencies
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp .env.example .env
```

Configure the following required variables in `.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/hotel-management

# JWT Secret (use a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure

# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# CORS Configuration
CORS_ORIGINS=http://localhost:3001
FRONTEND_URL=http://localhost:3001
```

### 3. Database Setup

Ensure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or if using MongoDB with Docker
docker run --name mongodb -p 27017:27017 -d mongo:latest
```

### 4. Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Register Kitchen Staff
```http
POST /auth/register/kitchen
Content-Type: application/json

{
  "name": "Chef Mike",
  "email": "chef.mike@example.com",
  "password": "password123"
}
```

#### Register Delivery Staff
```http
POST /auth/register/delivery
Content-Type: application/json

{
  "name": "Driver John",
  "email": "driver.john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Order Management

#### Create Order
```http
POST /orders
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "items": [
    {
      "name": "Pizza Margherita",
      "quantity": 2,
      "price": 12.99
    }
  ],
  "totalAmount": 25.98,
  "deliveryAddress": "123 Main St, City"
}
```

#### Get Order Status
```http
GET /orders/:orderId
Authorization: Bearer <jwt-token>
```

#### Update Order Status (Kitchen/Admin)
```http
PUT /admin/orders/:orderId/status
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "status": "preparing",
  "notes": "Started cooking"
}
```

### Payment Processing

#### Create Payment Intent
```http
POST /payment/intent
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "orderId": "order-id-here",
  "amount": 25.98
}
```

#### Create COD Payment
```http
POST /payment/cod
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "orderId": "order-id-here",
  "amount": 25.98
}
```

### Admin Panel

#### Dashboard Statistics
```http
GET /admin/dashboard/stats
Authorization: Bearer <admin-jwt-token>
```

#### Get All Orders (Paginated)
```http
GET /admin/orders?status=pending&page=1&limit=10
Authorization: Bearer <admin-jwt-token>
```

#### Payment Analytics
```http
GET /admin/payments/analytics?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <admin-jwt-token>
```

#### User Management
```http
GET /admin/users?role=user&page=1&limit=10
Authorization: Bearer <admin-jwt-token>
```

### Real-time Notifications

Connect to Socket.IO endpoint with authentication:

```javascript
const socket = io('http://localhost:3000/notifications', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Listen for notifications
socket.on('notification', (data) => {
  console.log('New notification:', data);
});
```

## 🔒 Role-based Access Control

### User Roles & Permissions

- **User**: Can place orders, view their orders, make payments
- **Kitchen**: Can view all orders, update order status to preparing/ready
- **Delivery**: Can view assigned orders, update delivery status
- **Admin**: Full access to all endpoints, user management, analytics

### Protected Routes Examples

```javascript
// Only users can place orders
@Roles('user')
@Post('/orders')

// Kitchen and admin can update order status
@Roles('kitchen', 'admin')
@Put('/orders/:id/status')

// Only admin can access analytics
@Roles('admin')
@Get('/admin/dashboard/stats')
```

## 🔔 Real-time Features

The system supports real-time notifications for:

- **Order Status Updates**: Users receive instant updates when their order status changes
- **New Orders**: Kitchen staff get notified of new orders
- **Delivery Ready**: Delivery staff get notified when orders are ready
- **Payment Updates**: Real-time payment status updates
- **Admin Alerts**: System alerts and new user registrations

## 🛡 Security Features

### Production-Ready Security
- **Helmet**: Security headers
- **Rate Limiting**: 100 requests per minute per IP
- **CORS**: Configurable origins
- **Input Validation**: All inputs validated with DTOs
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for secure password storage
- **Global Exception Handling**: Consistent error responses

### Rate Limiting Configuration
```typescript
ThrottlerModule.forRoot([{
  ttl: 60000, // 1 minute
  limit: 100, // 100 requests per minute
}])
```

## 📊 Payment Integration

### Stripe Webhook Setup

1. Configure your Stripe webhook endpoint: `https://yourapi.com/payment/webhook`
2. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
3. Add the webhook secret to your `.env` file

### Supported Payment Methods
- **Credit/Debit Cards** via Stripe
- **Cash on Delivery (COD)**

## 🚨 Error Handling

The API uses consistent error response format:

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/endpoint",
  "method": "POST",
  "message": "Validation failed",
  "details": ["Email is required", "Password must be at least 6 characters"]
}
```

## 📈 System Monitoring

### Health Check Endpoint
```http
GET /admin/system/health
Authorization: Bearer <admin-jwt-token>
```

Response includes:
- Database connection status
- Collection counts
- Server uptime
- Memory usage

## 🔧 Development

### Available Scripts

```bash
# Development
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Testing
npm run test
npm run test:e2e

# Linting
npm run lint
```

### Project Structure

```
src/
├── admin/           # Admin panel and business logic
├── auth/            # Authentication module
├── common/          # Shared DTOs, filters, guards
├── delivery/        # Delivery management
├── kitchen/         # Kitchen operations
├── notifications/   # Real-time notifications
├── orders/          # Order management
├── payment/         # Payment processing
└── users/           # User management
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `PORT` | Server port (default: 3000) | No |
| `CORS_ORIGINS` | Allowed CORS origins | No |
| `FRONTEND_URL` | Frontend URL for Socket.IO | No |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email your-email@domain.com or create an issue in the repository.

---

**Built with ❤️ using NestJS**

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
