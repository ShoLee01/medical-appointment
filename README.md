# Medical Appointment API - NestJS

Este proyecto implementa una API RESTful para gestión de citas médicas utilizando **NestJS**, combinando las mejores prácticas de desarrollo con escalabilidad en la nube. La arquitectura integra principios de _Clean Architecture_ y aprovecha el ecosistema TypeScript para un mantenimiento eficiente.

![NestJS Architecture](https://nestjs.com/img/logo-small.svg)

## Características Clave
- Framework: **NestJS 9+**
- Base de Datos: **AWS DynamoDB** (NoSQL)
- Despliegue: **AWS Lambda** + **API Gateway**
- Estructura: Módulos independientes con responsabilidades claras
- Validación: **Class-Validator** y **Pipes** integrados
- Documentación: Generación automática con **Swagger**

---

## Endpoints Principales

### 1. Crear Cita Médica - \`POST /appointments\`

**Request:**
```bash
curl -X POST 'https://xbwuay4759.execute-api.us-east-1.amazonaws.com/appointments' \\
-H 'Content-Type: application/json' \\
-d '{
  "insuredId": "00026",
  "scheduleId": 1,
  "countryISO": "PE"
}'
```

**Response (201 Created):**
```json
{
  "id": "8748b543-79c3-42b3-9356-0de68442349e",
  "status": "pending",
  "scheduleId": 1,
  "createdAt": "2025-05-03T01:14:26.415Z"
}
```

### 2. Listar Citas por Asegurado - \`GET /appointments\`

**Request:**
```bash
curl -X GET 'https://xbwuay4759.execute-api.us-east-1.amazonaws.com/appointments?insuredId=00026'
```

**Response (200 OK):**
```json
[
  {
    "id": "8748b543-79c3-42b3-9356-0de68442349e",
    "status": "pending",
    "scheduleId": 1,
    "createdAt": "2025-05-03T01:14:26.415Z"
  },
  {
    "id": "f9701feb-d111-49a6-bcd0-54ac7c6c0f86",
    "status": "completed",
    "scheduleId": 1,
    "createdAt": "2025-05-03T01:17:32.260Z"
  }
]
```

---

## Estructura del Proyecto

```
src/
├── core/
│   ├── domain/
│   │   ├── appointment.entity.ts
│   │   └── value-objects/
│   ├── ports/
│   │   ├── appointment.repository.ts
│   │   └── event.publisher.ts
│   └── exceptions/
├── application/
│   ├── dto/
│   ├── services/
│   │   ├── appointment.service.ts
│   │   └── scheduler/
│   └── use-cases/
├── infrastructure/
│   ├── controllers/
│   │   ├── appointment.controller.ts
│   │   └── health.controller.ts
│   ├── repositories/
│   │   ├── dynamodb/
│   │   └── mysql/
│   ├── messaging/
│   │   ├── aws/
│   │   └── event-bridge/
│   └── config/
├── shared/
│   ├── utils/
│   └── middleware/
├── tests/
└── main.ts
```

---

## Requisitos Previos

- Node.js 16+
- AWS CLI configurado
- NestJS CLI (\`npm i -g @nestjs/cli\`)
- Docker (para DynamoDB local)

---

## Configuración Inicial

1. Clonar repositorio:
```bash
git clone https://github.com/ShoLee01/medical-appointment.git
cd medical-appointments-api
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (crear \`.env\`):
```env
AWS_REGION=us-east-1
DYNAMODB_TABLE=medical-appointments
STAGE=dev
```

---

## Desarrollo Local

Iniciar servidor con DynamoDB local:
```bash
npm run start:dev
```

Ejecutar pruebas unitarias:
```bash
npm test
```

Generar documentación Swagger:
```bash
npm run swagger
```
Acceder a: \`http://localhost:3000/api/docs\`

---

## Despliegue en AWS

1. Configurar credenciales AWS:
```bash
aws configure
```

2. Empaquetar aplicación:
```bash
npm run build
```

3. Desplegar con Serverless Framework:
```bash
npx serverless deploy --stage prod --region us-east-1
```

---

## Flujo de Trabajo de Citas

1. Validación de entrada con \`CreateAppointmentDto\`
2. Verificación de disponibilidad en agenda
3. Persistencia en DynamoDB
4. Publicación de evento a SNS
5. Respuesta estructurada al cliente

---

## Políticas de Calidad

- TypeScript estricto (\`strict: true\`)
- Linting con ESLint/Prettier
- Tests unitarios con Jest
- Validación automática de DTOs
- Seguridad por defecto (CORS, rate limiting)

---

## Monitorización

Integrado con:
- AWS CloudWatch (logs)
- X-Ray (tracing)
- Custom metrics con CloudWatch Metrics

---

## Contribución

1. Crear fork del repositorio
2. Crear feature branch (\`git checkout -b feature/awesome-feature\`)
3. Commit cambios (\`git commit -m 'Add awesome feature'\`)
4. Push al branch (\`git push origin feature/awesome-feature\`)
5. Abrir Pull Request

---

## Licencia

Distribuido bajo licencia MIT. Ver \`LICENSE\` para más detalles.

---

**Nota Técnica:** Para entornos de producción, se recomienda implementar:  
✅ Autorizadores JWT via Cognito  
✅ Encriptación de datos sensibles (KMS)  
✅ Versioneo de API (\`/v1/appointments\`)  
✅ Circuit Breaker para integraciones externas