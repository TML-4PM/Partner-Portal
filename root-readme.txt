# Eye Spy Partners - Microservices Architecture

## Overview
Modern microservices architecture for the Eye Spy Partners platform, providing file management, analytics, and insights capabilities.

## Services
- **File Service**: Handles file upload, storage, and management
- **Analytics Service**: Processes and analyzes user interactions
- **Insights Service**: Generates actionable insights from analytics data
- **Gateway**: Next.js frontend and API gateway

## Prerequisites
- Node.js 16+
- Docker and Docker Compose
- Kubernetes (for production deployment)

## Quick Start
1. Clone the repository:
```bash
git clone https://github.com/your-username/eye-spy-partners.git
cd eye-spy-partners
```

2. Install dependencies:
```bash
npm install
```

3. Start development environment:
```bash
npm run dev
```

4. Access services:
- Gateway/Frontend: http://localhost:3000
- File Service: http://localhost:3001
- Analytics Service: http://localhost:3002
- Insights Service: http://localhost:3003

## Development

### Project Structure
```
eye-spy-partners/
├── services/          # Individual microservices
├── gateway/           # Next.js frontend
├── shared/           # Shared types and utilities
└── infrastructure/   # K8s and Terraform configs
```

### Running Tests
```bash
npm test
```

### Building Services
```bash
npm run build
```

### Deployment
```bash
npm run deploy
```

## Configuration
Environment variables for each service can be configured in:
- `.env` files for local development
- `docker-compose.yml` for Docker environment
- Kubernetes config files for production

## Contributing
1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License
MIT