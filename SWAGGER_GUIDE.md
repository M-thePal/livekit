# Swagger API Documentation Guide

## Accessing Swagger UI

Once your application is running, visit:
```
http://localhost:3000/api
```

## Features

### 1. Interactive API Explorer
- Browse all available endpoints organized by tags
- View detailed descriptions for each endpoint
- See request/response schemas
- Understand required vs optional parameters

### 2. Try It Out
Click "Try it out" on any endpoint to:
- Fill in parameters and request body
- Execute real API calls
- See actual responses
- Test different scenarios

### 3. Model Schemas
- View data transfer object (DTO) definitions
- See all properties and their types
- Understand validation rules
- Check examples

## Quick Start with Swagger

### Example 1: Create a Room

1. Navigate to **POST /livekit/rooms**
2. Click "Try it out"
3. Edit the request body:
```json
{
  "name": "test-room",
  "emptyTimeout": 300,
  "maxParticipants": 10
}
```
4. Click "Execute"
5. View the response below

### Example 2: Generate Access Token

1. Navigate to **POST /livekit/token**
2. Click "Try it out"
3. Edit the request body:
```json
{
  "roomName": "test-room",
  "participantName": "john-doe",
  "canPublish": true,
  "canSubscribe": true
}
```
4. Click "Execute"
5. Copy the token from the response

### Example 3: List All Rooms

1. Navigate to **GET /livekit/rooms**
2. Click "Try it out"
3. Click "Execute"
4. View all active rooms in the response

## API Endpoints Overview

### Server Information
- **GET /livekit/info** - Get LiveKit server connection details

### Room Management
- **POST /livekit/rooms** - Create a new room
- **GET /livekit/rooms** - List all rooms
- **GET /livekit/rooms/{roomName}** - Get specific room details
- **PATCH /livekit/rooms/{roomName}** - Update room settings
- **DELETE /livekit/rooms/{roomName}** - Delete a room

### Participant Management
- **GET /livekit/rooms/{roomName}/participants** - List participants
- **DELETE /livekit/rooms/{roomName}/participants/{participantIdentity}** - Remove participant
- **POST /livekit/rooms/{roomName}/participants/{participantIdentity}/mute** - Mute/unmute track

### Token Generation
- **POST /livekit/token** - Generate JWT access token

## Understanding Responses

### Success Responses

#### 200 OK
Standard success response with data:
```json
{
  "sid": "RM_xxxxx",
  "name": "my-room",
  "numParticipants": 2
}
```

#### 201 Created
Resource created successfully:
```json
{
  "sid": "RM_xxxxx",
  "name": "my-room",
  "creationTime": "1234567890"
}
```

#### 204 No Content
Operation successful, no data returned (e.g., DELETE operations)

### Error Responses

#### 400 Bad Request
Invalid request data:
```json
{
  "statusCode": 400,
  "message": ["name should not be empty"],
  "error": "Bad Request"
}
```

#### 404 Not Found
Resource not found:
```json
{
  "statusCode": 404,
  "message": "Room not found: my-room",
  "error": "Not Found"
}
```

#### 409 Conflict
Resource already exists:
```json
{
  "statusCode": 409,
  "message": "Room already exists",
  "error": "Conflict"
}
```

## Tips for Using Swagger

### 1. Expand/Collapse Sections
- Click on endpoint tags to expand/collapse groups
- Use "Expand Operations" to see all at once

### 2. Schema Exploration
- Click on "Schema" tab in request/response sections
- View the complete data structure
- See validation rules and constraints

### 3. Example Values
- Click "Example Value" to auto-fill request bodies
- Modify values as needed for your test

### 4. Response Inspection
- Check the "Response body" for actual data
- View "Response headers" for metadata
- Check "Curl" command to see equivalent curl request

### 5. Filter Endpoints
- Use the search box at the top
- Filter by endpoint path or description

## Exporting API Specification

### Download OpenAPI JSON
1. Visit: `http://localhost:3000/api-json`
2. Save the JSON file
3. Use with other tools (Postman, Insomnia, etc.)

### Generate Client SDKs
Use the OpenAPI specification to generate client libraries:
```bash
# Install OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
openapi-generator-cli generate \
  -i http://localhost:3000/api-json \
  -g typescript-axios \
  -o ./generated-client
```

## Common Workflows

### Workflow 1: Complete Room Setup
1. **Create Room**: POST /livekit/rooms
2. **Verify Creation**: GET /livekit/rooms/{roomName}
3. **Generate Token**: POST /livekit/token
4. **Check Participants**: GET /livekit/rooms/{roomName}/participants

### Workflow 2: Room Management
1. **List Rooms**: GET /livekit/rooms
2. **Update Settings**: PATCH /livekit/rooms/{roomName}
3. **Remove Participant**: DELETE /livekit/rooms/{roomName}/participants/{identity}
4. **Delete Room**: DELETE /livekit/rooms/{roomName}

### Workflow 3: Testing Token Generation
1. **Create Room**: POST /livekit/rooms
2. **Generate Multiple Tokens**: POST /livekit/token (with different participants)
3. **Verify Tokens**: Use in LiveKit client to connect

## Integration with Other Tools

### Import to Postman
1. In Swagger UI, click "Export" or visit `/api-json`
2. Open Postman
3. Import → Link → Paste: `http://localhost:3000/api-json`
4. Collection created automatically

### Use with Insomnia
1. Download OpenAPI spec from `/api-json`
2. Open Insomnia
3. Import → From URL → `http://localhost:3000/api-json`

### Generate Documentation
```bash
# Install Redoc CLI
npm install -g redoc-cli

# Generate static HTML documentation
redoc-cli bundle http://localhost:3000/api-json \
  -o api-documentation.html
```

## Customization

The Swagger configuration is in `src/main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('LiveKit Server Controller API')
  .setDescription('Your description')
  .setVersion('1.0')
  .addTag('your-tag')
  .build();
```

## Security

In production:
- Add authentication to Swagger UI
- Restrict access to documentation
- Use environment variables for server URLs
- Consider disabling in production or protecting with auth

Example with basic auth:
```typescript
SwaggerModule.setup('api', app, document, {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customSiteTitle: 'API Docs',
  // Add basic auth here if needed
});
```

## Troubleshooting

### Swagger UI Not Loading
- Check if app is running: `http://localhost:3000`
- Verify port in `.env` file
- Check console for errors

### Endpoints Not Showing
- Ensure controllers are properly decorated with `@ApiTags()`
- Check that DTOs have `@ApiProperty()` decorators
- Rebuild the application: `npm run build`

### "Try it out" Not Working
- Check CORS settings in `main.ts`
- Verify LiveKit server is running
- Check browser console for errors

## Best Practices

1. **Always test in Swagger first** before integrating
2. **Check response schemas** to understand data structure
3. **Use example values** as templates
4. **Export OpenAPI spec** for team collaboration
5. **Document custom errors** in controller decorators

## Additional Resources

- [Swagger Documentation](https://swagger.io/docs/)
- [NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)

---

Happy API exploring! 🚀

