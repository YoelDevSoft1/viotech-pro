# 🚀 Roadmap de Innovaciones VioTech Pro 2025
## Transformación a Plataforma de Nueva Generación

> **Stack Base:** Next.js 16 + React 19 + Node.js + Prisma + PostgreSQL + Supabase
> **Versión:** 2.0.0
> **Periodo:** Enero - Diciembre 2025
> **Última actualización:** Noviembre 2024

---

Ruta Frontend: C:\Users\Admin\Documents\SMD VITAL\SMD VITAL\viotech-pro

Ruta Backend: C:\Users\Admin\Documents\SMD VITAL\SMD VITAL\VioTech-main\backend

## 📋 Tabla de Contenido

1. [Visión General](#-visión-general)
2. [Stack Tecnológico 2025](#-stack-tecnológico-2025)
3. [Fase I: IA y Automatización Inteligente](#fase-i-ia-y-automatización-inteligente)
4. [Fase II: Colaboración en Tiempo Real](#fase-ii-colaboración-en-tiempo-real)
5. [Fase III: Analytics Avanzados y BI](#fase-iii-analytics-avanzados-y-bi)
6. [Plan de Implementación por Sprints](#-plan-de-implementación-2025)
7. [ROI y Métricas de Éxito](#-roi-y-métricas-de-éxito)

---

## 🎯 Visión General

Transformar VioTech Pro de una plataforma de gestión de servicios tradicional a una **plataforma inteligente de nueva generación** que:

- 🤖 **Predice** problemas antes de que ocurran
- 💬 **Colabora** en tiempo real como Slack/Discord
- 📊 **Analiza** y genera insights accionables automáticamente
- 🎯 **Optimiza** continuamente con machine learning
- 🚀 **Diferencia** radicalmente de la competencia

### Diferenciadores Clave

| Feature | Competencia | VioTech Pro 2025 |
|---------|-------------|------------------|
| Estimaciones | Manuales, imprecisas | ML predictivo con 87% precisión |
| Comunicación | Emails, polling | Tiempo real, WebRTC integrado |
| Reportes | Manuales, estáticos | Auto-generados con IA, dinámicos |
| Soporte | Reactivo | Proactivo con análisis de sentimiento |
| Analytics | Básicos | Predictivos (churn, ROI, benchmarking) |

---

## 🛠 Stack Tecnológico 2025

### Frontend
```json
{
  "framework": "Next.js 16 (App Router)",
  "ui": "React 19 + Tailwind CSS 4",
  "state": "Zustand + React Query v5",
  "realtime": "Supabase Realtime / Socket.io",
  "forms": "React Hook Form + Zod",
  "charts": "Recharts / Tremor",
  "video": "Daily.co / LiveKit",
  "ai": "Vercel AI SDK"
}
```

### Backend
```json
{
  "runtime": "Node.js 20 LTS",
  "framework": "Express.js / Hono (alternativa moderna)",
  "orm": "Prisma 7",
  "database": "PostgreSQL 16 + pgvector",
  "cache": "Redis / Upstash Redis",
  "queue": "BullMQ / Inngest",
  "storage": "Supabase Storage / CloudFlare R2",
  "search": "Meilisearch / Typesense"
}
```

### IA/ML
```json
{
  "llm": "OpenAI GPT-4o / Anthropic Claude 3.5 Sonnet",
  "embeddings": "OpenAI text-embedding-3-large",
  "ml": "TensorFlow.js / ONNX Runtime",
  "nlp": "Transformers.js (local) + Hugging Face",
  "sentiment": "BERT multilingüe",
  "framework": "LangChain.js / Vercel AI SDK"
}
```

### Infrastructure
```json
{
  "hosting": "Vercel (frontend) + Render/Railway (backend)",
  "monitoring": "Sentry + Axiom/Betterstack",
  "analytics": "PostHog / Mixpanel",
  "email": "Resend / React Email",
  "payments": "Wompi (actual) + Stripe (futuro)",
  "cdn": "Vercel Edge / CloudFlare"
}
```

---

## 🎯 Fase I: IA y Automatización Inteligente
### Sprints 15-20 (12 semanas)

### 1.1 Sistema de Predicción ML de Tiempos y Costos
**Sprint 15-16 (4 semanas)**

#### Tecnologías Actualizadas 2025
- **ML Framework:** TensorFlow.js 4.x (corre en Node.js)
- **Alternativa:** ONNX Runtime (modelos en Python, inference en Node.js)
- **Features Store:** PostgreSQL + TimescaleDB
- **Model Registry:** MLflow OSS / Local filesystem

#### Arquitectura Moderna
```typescript
// lib/ml/predictor.ts - Usando TensorFlow.js
import * as tf from '@tensorflow/tfjs-node';

interface PredictionInput {
  serviceType: string;
  complexity: 'low' | 'medium' | 'high';
  features: string[];
  estimatedHours: number;
  teamSize: number;
  techStack: string[];
}

interface PredictionOutput {
  predictedDays: number;
  confidenceInterval: [number, number];
  confidence: number;
  estimatedCost: {
    min: number;
    max: number;
    expected: number;
  };
  riskFactors: RiskFactor[];
}

class ProjectPredictor {
  private model: tf.LayersModel;

  async predict(input: PredictionInput): Promise<PredictionOutput> {
    // 1. Feature engineering
    const features = this.engineerFeatures(input);

    // 2. Predicción con TensorFlow
    const tensor = tf.tensor2d([features]);
    const prediction = this.model.predict(tensor) as tf.Tensor;
    const values = await prediction.data();

    // 3. Cálculo de intervalos de confianza
    const confidence = this.calculateConfidence(values);

    // 4. Identificación de riesgos
    const risks = await this.identifyRisks(input, values);

    return {
      predictedDays: values[0],
      confidenceInterval: [values[0] * 0.85, values[0] * 1.15],
      confidence,
      estimatedCost: this.calculateCost(values[0]),
      riskFactors: risks
    };
  }

  async trainModel(historicalData: ProjectData[]) {
    // Entrenar modelo con datos históricos
    const { xs, ys } = this.prepareTrainingData(historicalData);

    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [20], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1 })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    await model.fit(xs, ys, {
      epochs: 100,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
        }
      }
    });

    // Guardar modelo
    await model.save('file://./models/predictor');
  }
}
```

#### API Endpoints
```typescript
// app/api/predictions/timeline/route.ts
import { NextRequest } from 'next/server';
import { predictor } from '@/lib/ml/predictor';

export async function POST(req: NextRequest) {
  const input = await req.json();

  // Validación con Zod
  const validated = PredictionSchema.parse(input);

  // Predicción
  const result = await predictor.predict(validated);

  // Guardar predicción para feedback loop
  await savePrediction(validated, result);

  return Response.json(result);
}
```

#### Frontend Component
```typescript
// components/predictions/TimelinePredictor.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

export function TimelinePredictor() {
  const [input, setInput] = useState<PredictionInput>({
    serviceType: 'web_development',
    complexity: 'medium',
    features: [],
    estimatedHours: 0,
    teamSize: 3,
    techStack: []
  });

  const prediction = useMutation({
    mutationFn: (data: PredictionInput) =>
      fetch('/api/predictions/timeline', {
        method: 'POST',
        body: JSON.stringify(data)
      }).then(r => r.json())
  });

  return (
    <div className="space-y-6">
      {/* Form inputs */}

      {prediction.data && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold">Predicción</h3>
          <div className="mt-4 space-y-2">
            <p>Tiempo estimado: <strong>{prediction.data.predictedDays} días</strong></p>
            <p>Rango: {prediction.data.confidenceInterval[0]} - {prediction.data.confidenceInterval[1]} días</p>
            <p>Confianza: {(prediction.data.confidence * 100).toFixed(1)}%</p>

            {/* Visualización con Recharts */}
            <CostRangeChart data={prediction.data.estimatedCost} />

            {/* Risk factors */}
            <div className="mt-4">
              <h4 className="font-semibold">Factores de Riesgo:</h4>
              <ul className="space-y-2">
                {prediction.data.riskFactors.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span>{risk.recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### Implementación
- **Semana 1-2:** Setup ML pipeline, recolección de datos históricos
- **Semana 3:** Desarrollo y entrenamiento del modelo
- **Semana 4:** API + Frontend + Testing

**ROI Esperado:**
- 🎯 30% reducción en disputas de costos
- 🎯 25% aumento en conversión de ventas
- 🎯 15-20% premium pricing justificado

---

### 1.2 Asistente Virtual con IA para Creación de Tickets
**Sprint 17-18 (4 semanas)**

#### Tecnologías 2025
- **LLM:** OpenAI GPT-4o (Turbo) o Anthropic Claude 3.5 Sonnet
- **Framework:** Vercel AI SDK 3.x (streaming, RSC)
- **Embeddings:** OpenAI text-embedding-3-large + pgvector
- **UI:** Vercel AI SDK UI (useChat hook)

#### Arquitectura con Vercel AI SDK
```typescript
// app/api/ai/ticket-assistant/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, ticketContext } = await req.json();

  // Búsqueda semántica de tickets similares
  const similarTickets = await findSimilarTickets(
    messages[messages.length - 1].content
  );

  const systemPrompt = `
Eres un asistente experto en ayudar a crear tickets técnicos claros y completos.

CONTEXTO DE TICKETS SIMILARES:
${similarTickets.map(t => `- ${t.title}: ${t.description}`).join('\n')}

Tu objetivo:
1. Hacer preguntas específicas para entender el problema
2. Identificar información faltante
3. Sugerir categoría, prioridad y complejidad
4. Detectar tickets duplicados
5. Al final, generar un JSON completo para crear el ticket

Formato de respuesta cuando tengas toda la info:
\`\`\`json
{
  "ready": true,
  "ticket": {
    "title": "...",
    "description": "...",
    "priority": "alta|media|baja",
    "category": "...",
    "estimatedHours": 0
  }
}
\`\`\`
`;

  const result = streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages,
    temperature: 0.7,
    maxTokens: 1000,
  });

  return result.toDataStreamResponse();
}

// Búsqueda semántica con pgvector
async function findSimilarTickets(query: string, limit = 5) {
  // 1. Generar embedding del query
  const embedding = await generateEmbedding(query);

  // 2. Buscar similares con pgvector
  const tickets = await db.$queryRaw`
    SELECT
      id,
      title,
      description,
      1 - (embedding <=> ${embedding}::vector) as similarity
    FROM tickets
    WHERE 1 - (embedding <=> ${embedding}::vector) > 0.7
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;

  return tickets;
}
```

#### Frontend con useChat
```typescript
// components/tickets/AITicketAssistant.tsx
'use client';

import { useChat } from 'ai/react';

export function AITicketAssistant() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/ticket-assistant',
    onFinish: (message) => {
      // Detectar si el asistente generó el JSON final
      const jsonMatch = message.content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[1]);
        if (data.ready) {
          // Prellenar formulario con data generada
          fillTicketForm(data.ticket);
        }
      }
    }
  });

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                m.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Describe tu problema..."
            className="flex-1 rounded-lg border p-2"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
```

#### Schema Prisma
```prisma
model Ticket {
  id          String   @id @default(uuid())
  title       String
  description String
  embedding   Unsupported("vector(1536)")? // pgvector
  // ... otros campos
}
```

#### Setup pgvector
```sql
-- Activar extensión
CREATE EXTENSION IF NOT EXISTS vector;

-- Agregar columna de embedding
ALTER TABLE tickets ADD COLUMN embedding vector(1536);

-- Índice para búsqueda rápida
CREATE INDEX tickets_embedding_idx ON tickets
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**Implementación:**
- **Semana 1:** Setup Vercel AI SDK + pgvector
- **Semana 2:** Desarrollo del asistente conversacional
- **Semana 3:** Búsqueda semántica + detección duplicados
- **Semana 4:** Testing + ajustes de prompts

**ROI Esperado:**
- 🎯 40% reducción en aclaraciones
- 🎯 35% aumento en satisfacción
- 🎯 8-10 horas/semana ahorradas

---

### 1.3 Análisis de Sentimiento y Alertas Proactivas
**Sprint 19 (2 semanas)**

#### Tecnologías 2025
- **NLP:** Transformers.js (BERT local, sin API externa)
- **Alternativa:** OpenAI Moderation API + GPT-4o mini
- **Processing:** Inngest (queue moderno, reemplaza BullMQ)
- **Alerting:** Resend (email) + Pusher/Ably (push)

#### Análisis Local con Transformers.js
```typescript
// lib/ml/sentiment.ts
import { pipeline } from '@xenova/transformers';

class SentimentAnalyzer {
  private classifier: any;

  async initialize() {
    // Cargar modelo BERT multilingüe (español + inglés)
    this.classifier = await pipeline(
      'sentiment-analysis',
      'Xenova/bert-base-multilingual-uncased-sentiment'
    );
  }

  async analyze(text: string) {
    const result = await this.classifier(text);

    return {
      label: result[0].label, // 'positive', 'negative', 'neutral'
      score: result[0].score, // 0-1
      emotions: await this.detectEmotions(text),
      urgency: this.calculateUrgency(text, result[0])
    };
  }

  private async detectEmotions(text: string) {
    // Detectar emociones específicas: frustración, satisfacción, confusión
    const emotionModel = await pipeline(
      'text-classification',
      'Xenova/distilbert-base-uncased-emotion'
    );

    return emotionModel(text);
  }

  private calculateUrgency(text: string, sentiment: any): number {
    // Palabras clave de urgencia
    const urgentKeywords = [
      'urgente', 'bloqueado', 'crítico', 'no funciona',
      'emergency', 'blocking', 'critical', 'broken'
    ];

    const hasUrgentKeywords = urgentKeywords.some(k =>
      text.toLowerCase().includes(k)
    );

    // Score de urgencia: 0-100
    let urgency = 0;

    if (sentiment.label === 'negative' && sentiment.score > 0.8) {
      urgency += 50;
    }

    if (hasUrgentKeywords) {
      urgency += 30;
    }

    // Más factores...

    return Math.min(urgency, 100);
  }
}
```

#### Background Jobs con Inngest
```typescript
// inngest/functions.ts
import { inngest } from './client';

export const analyzeComment = inngest.createFunction(
  { id: 'analyze-comment' },
  { event: 'comment.created' },
  async ({ event, step }) => {
    const { commentId, text, userId, ticketId } = event.data;

    // Step 1: Analizar sentimiento
    const sentiment = await step.run('analyze-sentiment', async () => {
      return await sentimentAnalyzer.analyze(text);
    });

    // Step 2: Guardar análisis
    await step.run('save-analysis', async () => {
      return await db.sentimentAnalysis.create({
        data: {
          commentId,
          sentiment: sentiment.label,
          confidence: sentiment.score,
          emotions: sentiment.emotions,
          urgencyScore: sentiment.urgency
        }
      });
    });

    // Step 3: Si sentimiento negativo + alta confianza, alertar
    if (sentiment.label === 'negative' && sentiment.score > 0.75) {
      await step.run('create-alert', async () => {
        const client = await getClient(userId);

        await createAlert({
          type: 'CLIENT_DISSATISFACTION',
          priority: 'high',
          clientId: client.id,
          ticketId,
          reason: sentiment.emotions,
          urgencyScore: sentiment.urgency,
          recommendedActions: generateActions(sentiment)
        });

        // Notificar al equipo
        await notifyTeam({
          title: '🚨 Cliente en riesgo',
          message: `${client.name} mostró sentimiento negativo en ticket #${ticketId}`,
          data: sentiment
        });
      });
    }

    return { success: true, sentiment };
  }
);
```

#### Dashboard de Health
```typescript
// app/dashboard/client-health/page.tsx
import { getClientsAtRisk } from '@/lib/analytics';

export default async function ClientHealthPage() {
  const data = await getClientsAtRisk();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Salud de Clientes</h1>

      {/* Score general */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          title="Health Score"
          value={data.overallHealth.score}
          trend={data.overallHealth.trend}
          color={getHealthColor(data.overallHealth.score)}
        />
        <MetricCard
          title="Clientes en Riesgo"
          value={data.atRiskClients}
          color="red"
        />
        <MetricCard
          title="NPS Promedio"
          value={data.averageNPS}
          color="green"
        />
      </div>

      {/* Lista de clientes en riesgo */}
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Cliente</th>
              <th className="p-4 text-left">Risk Score</th>
              <th className="p-4 text-left">Sentimiento</th>
              <th className="p-4 text-left">Problemas</th>
              <th className="p-4 text-left">Acción</th>
            </tr>
          </thead>
          <tbody>
            {data.clientsAtRisk.map((client) => (
              <tr key={client.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{client.name}</td>
                <td className="p-4">
                  <RiskBadge score={client.riskScore} />
                </td>
                <td className="p-4">
                  <SentimentIndicator sentiment={client.recentSentiment} />
                </td>
                <td className="p-4">
                  <ul className="text-sm space-y-1">
                    {client.issues.map((issue, i) => (
                      <li key={i} className="text-red-600">{issue}</li>
                    ))}
                  </ul>
                </td>
                <td className="p-4">
                  <button className="text-blue-600 hover:underline">
                    Intervenir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**Implementación:**
- **Semana 1:** Setup Transformers.js + Inngest + pruebas de modelo
- **Semana 2:** Dashboard + sistema de alertas + integración

**ROI Esperado:**
- 🎯 25% reducción en churn
- 🎯 40% aumento en NPS
- 🎯 $100k+ valor de retención anual

---

### 1.4 Generación Automática de Reportes Ejecutivos
**Sprint 20 (2 semanas)**

#### Tecnologías 2025
- **LLM:** GPT-4o para narrativas
- **PDF:** React-PDF o Puppeteer
- **Scheduling:** Inngest (cron jobs)
- **Email:** Resend + React Email (templates)

#### Generador de Reportes
```typescript
// lib/reports/executive-report-generator.ts
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

class ExecutiveReportGenerator {
  async generateWeeklyReport(clientId: string, period: DateRange) {
    // 1. Recopilar métricas
    const metrics = await this.aggregateMetrics(clientId, period);

    // 2. Generar narrativa con GPT-4o
    const narrative = await this.generateNarrative(metrics);

    // 3. Crear visualizaciones
    const charts = await this.generateCharts(metrics);

    // 4. Compilar PDF
    const pdf = await this.compilePDF({
      narrative,
      charts,
      metrics,
      clientBranding: await getClientBranding(clientId)
    });

    // 5. Enviar por email
    await this.sendReport(clientId, pdf, narrative);

    return { success: true, reportId: pdf.id };
  }

  private async generateNarrative(metrics: ProjectMetrics) {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: `
Eres un ejecutivo de proyecto escribiendo un reporte semanal.
Escribe en español, tono profesional pero accesible.
Estructura:
1. Resumen ejecutivo (2-3 párrafos)
2. Destacados (logros clave)
3. Áreas de atención (problemas/riesgos)
4. Próximos pasos
5. Proyección de timeline

Enfócate en el "por qué" y el impacto de negocio, no solo el "qué".
`,
      prompt: `
Genera un reporte ejecutivo para el periodo ${metrics.period}.

MÉTRICAS:
- Tareas completadas: ${metrics.completedTasks}/${metrics.totalTasks} (${metrics.completionRate}%)
- Velocity: ${metrics.velocity} pts/semana
- Bugs reportados: ${metrics.bugsReported} (-${metrics.bugReduction}% vs semana anterior)
- Tiempo de respuesta promedio: ${metrics.avgResponseTime}h

LOGROS CLAVE:
${metrics.achievements.map(a => `- ${a}`).join('\n')}

PROBLEMAS/RIESGOS:
${metrics.risks.map(r => `- ${r.description} (impacto: ${r.impact})`).join('\n')}

PRÓXIMOS HITOS:
${metrics.upcomingMilestones.map(m => `- ${m.name} (${m.dueDate})`).join('\n')}
`,
      temperature: 0.7,
      maxTokens: 2000,
    });

    return text;
  }

  private async compilePDF(data: ReportData) {
    // Usando React-PDF
    const MyDocument = (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header con branding del cliente */}
          <View style={styles.header}>
            <Image src={data.clientBranding.logo} />
            <Text>Reporte Ejecutivo - Semana {data.metrics.weekNumber}</Text>
          </View>

          {/* Narrativa */}
          <View style={styles.section}>
            <Text>{data.narrative}</Text>
          </View>

          {/* Gráficos */}
          {data.charts.map((chart, i) => (
            <Image key={i} src={chart.dataUrl} />
          ))}

          {/* Footer */}
          <View style={styles.footer}>
            <Text>Generado automáticamente por VioTech Pro</Text>
            <Text>{new Date().toLocaleDateString('es-ES')}</Text>
          </View>
        </Page>
      </Document>
    );

    const pdfBlob = await pdf(MyDocument).toBlob();

    // Guardar en Supabase Storage
    const { data: upload } = await supabase.storage
      .from('reports')
      .upload(`${data.clientId}/report-${Date.now()}.pdf`, pdfBlob);

    return { id: upload.path, url: getPublicUrl(upload.path) };
  }

  private async sendReport(clientId: string, pdf: any, summary: string) {
    const client = await getClient(clientId);

    await resend.emails.send({
      from: 'reportes@viotech.pro',
      to: client.executives.map(e => e.email),
      subject: `Reporte Ejecutivo - Semana ${getCurrentWeek()}`,
      react: ExecutiveReportEmail({
        clientName: client.name,
        summary: summary.split('\n\n')[0], // Primer párrafo
        reportUrl: pdf.url,
        weekNumber: getCurrentWeek()
      }),
      attachments: [
        {
          filename: 'reporte-ejecutivo.pdf',
          path: pdf.url
        }
      ]
    });
  }
}
```

#### React Email Template
```typescript
// emails/ExecutiveReportEmail.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Button,
  Section
} from '@react-email/components';

export function ExecutiveReportEmail({ clientName, summary, reportUrl, weekNumber }) {
  return (
    <Html>
      <Head />
      <Preview>Reporte Ejecutivo - Semana {weekNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            Reporte Ejecutivo - Semana {weekNumber}
          </Heading>

          <Text style={text}>Hola equipo de {clientName},</Text>

          <Text style={text}>
            Adjunto encontrarán el reporte ejecutivo de esta semana con el progreso
            de su proyecto.
          </Text>

          <Section style={highlightBox}>
            <Heading as="h2" style={h2}>Resumen Ejecutivo</Heading>
            <Text style={text}>{summary}</Text>
          </Section>

          <Button href={reportUrl} style={button}>
            Ver Reporte Completo
          </Button>

          <Text style={footer}>
            Este reporte fue generado automáticamente por VioTech Pro.
            Si tienen preguntas, responde a este email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};
// ... más estilos
```

#### Cron Job con Inngest
```typescript
// inngest/functions.ts
export const generateWeeklyReports = inngest.createFunction(
  { id: 'generate-weekly-reports' },
  { cron: '0 9 * * MON' }, // Cada lunes a las 9am
  async ({ step }) => {
    // Obtener todos los clientes activos
    const clients = await step.run('get-active-clients', async () => {
      return await db.client.findMany({
        where: { status: 'active', autoReportsEnabled: true }
      });
    });

    // Generar reportes en paralelo
    await step.run('generate-reports', async () => {
      return await Promise.all(
        clients.map(client =>
          reportGenerator.generateWeeklyReport(
            client.id,
            getLastWeekRange()
          )
        )
      );
    });

    return { reportsGenerated: clients.length };
  }
);
```

**Implementación:**
- **Semana 1:** Desarrollo del generador + templates
- **Semana 2:** Testing + deployment + cron jobs

**ROI Esperado:**
- 🎯 12-15 horas/semana ahorradas
- 🎯 30% aumento en renovaciones
- 🎯 10% premium pricing justificado

---

## 🤝 Fase II: Colaboración en Tiempo Real
### Sprints 21-24 (8 semanas)

### 2.1 Sistema de Comentarios en Tiempo Real
**Sprint 21 (2 semanas)**

#### Tecnologías 2025
- **Opción 1:** Supabase Realtime (ya integrado)
- **Opción 2:** Ably (más robusto, mejor DX)
- **Opción 3:** Liveblocks (collaboration-focused)

#### Implementación con Supabase Realtime
```typescript
// hooks/useRealtimeComments.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeComments(ticketId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Cargar comentarios iniciales
    loadComments(ticketId).then(setComments);

    // Suscribirse a canal del ticket
    const channel = supabase
      .channel(`ticket:${ticketId}`)

      // Nuevos comentarios
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          setComments(prev => [...prev, payload.new as Comment]);

          // Notificación toast
          if (payload.new.author_id !== currentUser.id) {
            toast.success(`Nuevo comentario de ${payload.new.author_name}`);
          }
        }
      )

      // Comentarios actualizados
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          setComments(prev =>
            prev.map(c => c.id === payload.new.id ? payload.new as Comment : c)
          );
        }
      )

      // Presencia (quién está viendo)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineUsers(Object.values(state).flat() as User[]);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        toast.info(`${newPresences[0].user.name} se unió a la conversación`);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        toast.info(`${leftPresences[0].user.name} salió de la conversación`);
      })

      // Typing indicators (broadcast)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== currentUser.id) {
          setTypingUsers(prev => new Set(prev).add(payload.userId));

          // Limpiar después de 3s
          setTimeout(() => {
            setTypingUsers(prev => {
              const next = new Set(prev);
              next.delete(payload.userId);
              return next;
            });
          }, 3000);
        }
      })

      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track presencia
          await channel.track({
            user: currentUser,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [ticketId]);

  const sendTypingIndicator = () => {
    const channel = supabase.channel(`ticket:${ticketId}`);
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUser.id, userName: currentUser.name }
    });
  };

  return {
    comments,
    onlineUsers,
    typingUsers,
    sendTypingIndicator
  };
}
```

#### UI Component
```typescript
// components/tickets/RealtimeComments.tsx
'use client';

import { useRealtimeComments } from '@/hooks/useRealtimeComments';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

export function RealtimeComments({ ticketId }: { ticketId: string }) {
  const {
    comments,
    onlineUsers,
    typingUsers,
    sendTypingIndicator
  } = useRealtimeComments(ticketId);

  const { register, handleSubmit, reset, watch } = useForm();

  // Enviar typing indicator mientras escribe
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'content' && value.content) {
        sendTypingIndicator();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: { content: string }) => {
    await createComment(ticketId, data.content);
    reset();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header con usuarios online */}
      <div className="border-b p-4 flex items-center gap-2">
        <div className="flex -space-x-2">
          {onlineUsers.map(user => (
            <Avatar key={user.id} user={user} online />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {onlineUsers.length} {onlineUsers.length === 1 ? 'persona' : 'personas'} viendo
        </span>
      </div>

      {/* Comentarios con animaciones */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {comments.map(comment => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                comment.author_id === currentUser.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  comment.author_id === currentUser.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {comment.author_name}
                  </span>
                  <span className="text-xs opacity-70">
                    {formatTime(comment.created_at)}
                  </span>
                  {isRecent(comment.created_at) && (
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                      Nuevo
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{comment.content}</p>

                {/* Read receipts */}
                {comment.read_by && (
                  <div className="mt-2 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span className="text-xs opacity-70">
                      Visto por {comment.read_by.length}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicators */}
        {typingUsers.size > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 italic"
          >
            {Array.from(typingUsers).map(userId => {
              const user = onlineUsers.find(u => u.id === userId);
              return user?.name;
            }).filter(Boolean).join(', ')} {typingUsers.size === 1 ? 'está' : 'están'} escribiendo...
          </motion.div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="border-t p-4">
        <div className="flex gap-2">
          <textarea
            {...register('content', { required: true })}
            placeholder="Escribe un comentario..."
            className="flex-1 rounded-lg border p-2 resize-none"
            rows={3}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
```

**Implementación:**
- **Semana 1:** Core funcionalidad (mensajes en tiempo real)
- **Semana 2:** Presencia, typing indicators, read receipts

**ROI Esperado:**
- 🎯 50% reducción en tiempo de resolución
- 🎯 45% aumento en engagement
- 🎯 Diferenciación competitiva clara

---

### 2.2 Video Calls Integrados
**Sprint 22-23 (4 semanas)**

#### Tecnologías 2025
- **Opción 1:** Daily.co (más fácil, buena UX)
- **Opción 2:** LiveKit (open-source, más control)
- **Opción 3:** Agora (enterprise, escalable)
- **Transcripción:** Whisper API o Deepgram

#### Implementación con Daily.co
```typescript
// lib/video/daily-client.ts
import DailyIframe, { DailyCall } from '@daily-co/daily-js';

export class VideoCallManager {
  async createRoom(ticketId: string, participants: string[]) {
    // Crear sala en Daily.co
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DAILY_API_KEY}`
      },
      body: JSON.stringify({
        name: `ticket-${ticketId}`,
        privacy: 'private',
        properties: {
          max_participants: 10,
          enable_recording: 'cloud',
          enable_chat: true,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + 3600 // 1 hora
        }
      })
    });

    const room = await response.json();

    // Crear tokens de acceso para participantes
    const tokens = await Promise.all(
      participants.map(userId => this.createToken(room.name, userId))
    );

    // Guardar en DB
    await db.videoCall.create({
      data: {
        ticketId,
        roomName: room.name,
        roomUrl: room.url,
        participants,
        status: 'created',
        scheduledFor: new Date()
      }
    });

    // Notificar a participantes
    await this.notifyParticipants(ticketId, room.url, participants);

    return {
      roomUrl: room.url,
      roomName: room.name,
      tokens
    };
  }

  private async createToken(roomName: string, userId: string) {
    const user = await getUser(userId);

    const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DAILY_API_KEY}`
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: user.name,
          is_owner: user.role === 'admin',
          enable_recording: user.role === 'admin'
        }
      })
    });

    const { token } = await response.json();
    return token;
  }
}
```

#### React Component
```typescript
// components/video/VideoCallModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';

export function VideoCallModal({ ticketId, onClose }: Props) {
  const [callFrame, setCallFrame] = useState<DailyCall | null>(null);
  const [callState, setCallState] = useState<'creating' | 'joining' | 'joined' | 'left'>('creating');
  const containerRef = useRef<HTMLDivElement>(null);

  const startCall = async () => {
    setCallState('creating');

    // Crear sala
    const { roomUrl, tokens } = await fetch('/api/video/create-room', {
      method: 'POST',
      body: JSON.stringify({ ticketId })
    }).then(r => r.json());

    setCallState('joining');

    // Crear iframe de Daily
    const frame = DailyIframe.createFrame(containerRef.current!, {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: 'none'
      },
      showLeaveButton: true,
      showFullscreenButton: true
    });

    setCallFrame(frame);

    // Eventos
    frame
      .on('joined-meeting', () => {
        setCallState('joined');

        // Notificar que se unió
        supabase
          .channel(`ticket:${ticketId}`)
          .send({
            type: 'broadcast',
            event: 'call-joined',
            payload: { userId: currentUser.id }
          });
      })
      .on('left-meeting', async () => {
        setCallState('left');

        // Procesar grabación
        await processRecording(ticketId, roomUrl);

        onClose();
      })
      .on('participant-joined', (event) => {
        toast.success(`${event.participant.user_name} se unió a la llamada`);
      })
      .on('participant-left', (event) => {
        toast.info(`${event.participant.user_name} salió de la llamada`);
      })
      .on('recording-started', () => {
        toast.info('Grabación iniciada');
      });

    // Unirse a la sala
    await frame.join({ url: roomUrl, token: tokens[currentUser.id] });
  };

  useEffect(() => {
    startCall();

    return () => {
      if (callFrame) {
        callFrame.destroy();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Llamada de Soporte - Ticket #{ticketId}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X />
          </button>
        </div>

        {/* Video container */}
        <div ref={containerRef} className="w-full h-[calc(100%-5rem)]">
          {callState === 'creating' && (
            <div className="flex items-center justify-center h-full">
              <Loader className="animate-spin" />
              <span>Creando sala de video...</span>
            </div>
          )}
          {callState === 'joining' && (
            <div className="flex items-center justify-center h-full">
              <Loader className="animate-spin" />
              <span>Uniéndose a la llamada...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### Procesamiento Post-Llamada
```typescript
// lib/video/post-processing.ts
import { Inngest } from 'inngest';

export const processRecording = inngest.createFunction(
  { id: 'process-video-recording' },
  { event: 'video.call-ended' },
  async ({ event, step }) => {
    const { ticketId, roomUrl } = event.data;

    // Step 1: Obtener grabación de Daily.co
    const recording = await step.run('fetch-recording', async () => {
      const recordings = await fetch(
        `https://api.daily.co/v1/recordings?room_name=${roomUrl}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.DAILY_API_KEY}`
          }
        }
      ).then(r => r.json());

      return recordings.data[0];
    });

    // Step 2: Descargar video y subir a Supabase Storage
    const videoUrl = await step.run('upload-video', async () => {
      const videoBlob = await fetch(recording.download_link).then(r => r.blob());

      const { data } = await supabase.storage
        .from('video-recordings')
        .upload(`${ticketId}/recording-${Date.now()}.mp4`, videoBlob);

      return supabase.storage
        .from('video-recordings')
        .getPublicUrl(data.path).data.publicUrl;
    });

    // Step 3: Transcribir con Whisper
    const transcript = await step.run('transcribe', async () => {
      const audioBlob = await extractAudio(recording.download_link);

      const formData = new FormData();
      formData.append('file', audioBlob);
      formData.append('model', 'whisper-1');
      formData.append('language', 'es');

      const response = await fetch(
        'https://api.openai.com/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: formData
        }
      );

      return response.json();
    });

    // Step 4: Generar resumen con GPT-4
    const summary = await step.run('generate-summary', async () => {
      const { text } = await generateText({
        model: openai('gpt-4o'),
        system: 'Eres un asistente que resume llamadas técnicas de soporte.',
        prompt: `
Genera un resumen de esta llamada de soporte:

TRANSCRIPCIÓN:
${transcript.text}

Incluye:
1. Problema principal discutido
2. Solución propuesta
3. Próximos pasos acordados
4. Puntos clave mencionados
`,
        temperature: 0.3
      });

      return text;
    });

    // Step 5: Agregar como comentario al ticket
    await step.run('add-to-ticket', async () => {
      await db.comment.create({
        data: {
          ticketId,
          authorId: 'system',
          content: `
📹 **Resumen de Videollamada**

${summary}

---

**Duración:** ${recording.duration} minutos
**Participantes:** ${recording.participants.map(p => p.user_name).join(', ')}

[Ver grabación](${videoUrl}) | [Ver transcripción completa](#)
          `,
          type: 'VIDEO_CALL_SUMMARY',
          metadata: {
            videoUrl,
            transcript: transcript.text,
            duration: recording.duration,
            participants: recording.participants
          }
        }
      });
    });

    return { success: true, summary };
  }
);
```

**Implementación:**
- **Semana 1-2:** Integración de Daily.co + UI básica
- **Semana 3:** Transcripción y resumen automático
- **Semana 4:** Testing + optimizaciones

**ROI Esperado:**
- 🎯 60% reducción en tiempo de resolución de problemas complejos
- 🎯 35% aumento en satisfacción
- 🎯 Diferenciación premium

---

### 2.3 Dashboard en Tiempo Real
**Sprint 24 (2 semanas)**

#### Tecnologías
- **Realtime:** Supabase Realtime
- **Charts:** Recharts / Tremor
- **State:** Zustand + React Query

#### Implementation
```typescript
// hooks/useRealtimeDashboard.ts
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useRealtimeDashboard(clientId: string) {
  const queryClient = useQueryClient();

  // Query inicial
  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics', clientId],
    queryFn: () => fetchDashboardMetrics(clientId),
    refetchInterval: false // No polling, usamos realtime
  });

  useEffect(() => {
    // Suscribirse a updates en tiempo real
    const channel = supabase
      .channel(`client-metrics:${clientId}`)

      // Broadcast de métricas actualizadas
      .on('broadcast', { event: 'metrics-update' }, ({ payload }) => {
        queryClient.setQueryData(
          ['dashboard-metrics', clientId],
          (old: any) => ({ ...old, ...payload })
        );
      })

      // Activity feed en tiempo real
      .on('broadcast', { event: 'activity-added' }, ({ payload }) => {
        queryClient.setQueryData(
          ['recent-activity', clientId],
          (old: Activity[] = []) => [payload, ...old].slice(0, 20)
        );

        // Notificación toast
        toast.info(formatActivity(payload));
      })

      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [clientId]);

  return { metrics };
}
```

#### Dashboard Component
```typescript
// app/dashboard/page.tsx
'use client';

import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard';
import { Card, Metric, Text, AreaChart, BadgeDelta } from '@tremor/react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { metrics } = useRealtimeDashboard(currentUser.clientId);

  if (!metrics) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard en Tiempo Real</h1>

      {/* KPIs con animaciones */}
      <div className="grid grid-cols-4 gap-4">
        <AnimatedMetricCard
          title="Tickets Activos"
          value={metrics.activeTickets}
          delta={metrics.ticketsDelta}
          deltaType={metrics.ticketsDelta > 0 ? 'increase' : 'decrease'}
        />
        <AnimatedMetricCard
          title="Progreso Sprint"
          value={`${metrics.sprintProgress}%`}
          delta={metrics.sprintVelocity}
        />
        <AnimatedMetricCard
          title="Tiempo de Respuesta"
          value={`${metrics.avgResponseTime}h`}
          delta={metrics.responseTimeDelta}
          deltaType={metrics.responseTimeDelta < 0 ? 'increase' : 'decrease'}
        />
        <AnimatedMetricCard
          title="Satisfacción"
          value={`${metrics.satisfaction}/5`}
          delta={metrics.satisfactionDelta}
        />
      </div>

      {/* Gráficos en tiempo real */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <Text>Velocity (últimas 4 semanas)</Text>
          <AreaChart
            className="mt-4 h-72"
            data={metrics.velocityHistory}
            index="week"
            categories={["points"]}
            colors={["blue"]}
            showAnimation
          />
        </Card>

        <Card>
          <Text>Build Status (CI/CD)</Text>
          <div className="mt-4 space-y-2">
            {metrics.cicdBuilds.map(build => (
              <BuildStatusItem
                key={build.id}
                build={build}
                realtime // Se actualiza en vivo
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Activity feed en tiempo real */}
      <Card>
        <Text>Actividad Reciente</Text>
        <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {metrics.recentActivity.map(activity => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <ActivityIcon type={activity.type} />
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}

// Componente con animación de número
function AnimatedMetricCard({ title, value, delta, deltaType }: Props) {
  return (
    <Card>
      <Text>{title}</Text>
      <Metric className="mt-2">
        <AnimatedNumber value={parseFloat(value)} />
      </Metric>
      {delta !== undefined && (
        <BadgeDelta deltaType={deltaType} className="mt-2">
          {delta > 0 ? '+' : ''}{delta}
        </BadgeDelta>
      )}
    </Card>
  );
}
```

#### Backend Broadcasting
```typescript
// lib/metrics/broadcaster.ts
export class MetricsBroadcaster {
  async broadcastUpdate(clientId: string, updates: Partial<DashboardMetrics>) {
    await supabase
      .channel(`client-metrics:${clientId}`)
      .send({
        type: 'broadcast',
        event: 'metrics-update',
        payload: updates
      });
  }

  async broadcastActivity(clientId: string, activity: Activity) {
    await supabase
      .channel(`client-metrics:${clientId}`)
      .send({
        type: 'broadcast',
        event: 'activity-added',
        payload: activity
      });
  }
}

// Hooks en eventos de la aplicación
async function onTicketStatusChanged(ticketId: string, newStatus: string) {
  const ticket = await getTicket(ticketId);

  // Actualizar métricas
  const metrics = await recalculateMetrics(ticket.clientId);
  await broadcaster.broadcastUpdate(ticket.clientId, metrics);

  // Agregar a activity feed
  await broadcaster.broadcastActivity(ticket.clientId, {
    type: 'ticket_status_changed',
    description: `Ticket #${ticketId} cambió a ${newStatus}`,
    timestamp: new Date(),
    metadata: { ticketId, newStatus }
  });
}
```

**Implementación:**
- **Semana 1:** Métricas en tiempo real + broadcasts
- **Semana 2:** Animaciones + optimizaciones de performance

**ROI Esperado:**
- 🎯 70% reducción en consultas de estado
- 🎯 25% aumento en percepción de profesionalismo
- 🎯 Mejor retención por transparencia

---

## 📊 Fase III: Analytics Avanzados y BI
### Sprints 25-28 (8 semanas)

### 3.1 Predicción de Churn con ML
**Sprint 25-26 (4 semanas)**

#### Stack ML
```typescript
// lib/ml/churn-predictor.ts
import * as tf from '@tensorflow/tfjs-node';

interface ClientFeatures {
  // Engagement
  loginFrequency: number; // logins/mes
  daysSinceLastLogin: number;
  ticketsCreated: number; // último mes
  commentsPosted: number;

  // Satisfacción
  avgSentimentScore: number; // -1 a 1
  negativeInteractions: number;
  supportEscalations: number;

  // Proyecto
  projectDelays: number;
  missedDeadlines: number;
  budgetOverruns: number;

  // Financiero
  paymentDelays: number;
  daysSinceLastPayment: number;
  totalSpent: number;

  // Temporal
  clientAgeDays: number;
  contractRenewalDays: number; // días hasta renovación
}

class ChurnPredictor {
  private model: tf.LayersModel;

  async predict(clientId: string): Promise<ChurnPrediction> {
    // 1. Extraer features
    const features = await this.extractFeatures(clientId);

    // 2. Normalizar
    const normalized = this.normalize(features);

    // 3. Predecir con modelo
    const tensor = tf.tensor2d([Object.values(normalized)]);
    const prediction = this.model.predict(tensor) as tf.Tensor;
    const probability = (await prediction.data())[0];

    // 4. Identificar factores de riesgo
    const riskFactors = this.identifyRiskFactors(features);

    // 5. Generar acciones recomendadas
    const actions = this.generateRetentionActions(probability, riskFactors);

    return {
      clientId,
      churnProbability: probability,
      riskLevel: this.categorizeRisk(probability),
      topRiskFactors: riskFactors.slice(0, 5),
      recommendedActions: actions,
      predictedAt: new Date()
    };
  }

  private categorizeRisk(probability: number): RiskLevel {
    if (probability > 0.7) return 'CRITICAL';
    if (probability > 0.5) return 'HIGH';
    if (probability > 0.3) return 'MEDIUM';
    return 'LOW';
  }

  private generateRetentionActions(
    probability: number,
    riskFactors: RiskFactor[]
  ): RetentionAction[] {
    const actions: RetentionAction[] = [];

    for (const factor of riskFactors) {
      switch (factor.type) {
        case 'low_engagement':
          actions.push({
            priority: 'HIGH',
            action: 'Re-engagement Campaign',
            description: 'Cliente inactivo. Enviar email personalizado y agendar llamada.',
            estimatedImpact: 0.15
          });
          break;

        case 'negative_sentiment':
          actions.push({
            priority: 'CRITICAL',
            action: 'Executive Escalation',
            description: 'Sentimiento negativo detectado. Escalate a CTO/CEO para llamada inmediata.',
            estimatedImpact: 0.25
          });
          break;

        case 'project_delays':
          actions.push({
            priority: 'HIGH',
            action: 'Timeline Review',
            description: 'Múltiples retrasos. Revisar timeline y resetear expectativas.',
            estimatedImpact: 0.20
          });
          break;

        // ... más casos
      }
    }

    return actions;
  }

  // Entrenar modelo con datos históricos
  async trainModel(historicalData: ChurnTrainingData[]) {
    const { xs, ys } = this.prepareTrainingData(historicalData);

    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [15], // 15 features
          units: 64,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' }) // Probabilidad 0-1
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    });

    await this.model.fit(xs, ys, {
      epochs: 100,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(
            `Epoch ${epoch}: loss=${logs.loss.toFixed(4)}, ` +
            `acc=${logs.acc.toFixed(4)}, val_acc=${logs.val_acc.toFixed(4)}`
          );
        }
      }
    });

    // Evaluar modelo
    const testData = this.prepareTestData();
    const evaluation = this.model.evaluate(testData.xs, testData.ys);
    console.log('Test accuracy:', await evaluation[1].data());

    // Guardar modelo
    await this.model.save('file://./models/churn-predictor');
  }
}
```

#### API + Cron Job
```typescript
// app/api/analytics/churn-risk/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const threshold = parseFloat(searchParams.get('threshold') || '0.3');

  // Obtener todos los clientes activos
  const clients = await db.client.findMany({
    where: { status: 'active' }
  });

  // Predecir churn para cada uno
  const predictions = await Promise.all(
    clients.map(c => churnPredictor.predict(c.id))
  );

  // Filtrar por threshold
  const atRisk = predictions.filter(p => p.churnProbability >= threshold);

  // Agrupar por nivel de riesgo
  const grouped = {
    critical: atRisk.filter(p => p.riskLevel === 'CRITICAL'),
    high: atRisk.filter(p => p.riskLevel === 'HIGH'),
    medium: atRisk.filter(p => p.riskLevel === 'MEDIUM')
  };

  return Response.json(grouped);
}

// Cron job diario para alertar sobre riesgo alto
export const dailyChurnCheck = inngest.createFunction(
  { id: 'daily-churn-check' },
  { cron: '0 9 * * *' }, // 9am todos los días
  async ({ step }) => {
    const predictions = await step.run('predict-churn', async () => {
      const clients = await db.client.findMany({ where: { status: 'active' } });
      return await Promise.all(clients.map(c => churnPredictor.predict(c.id)));
    });

    // Alertar sobre clientes críticos
    const critical = predictions.filter(p => p.riskLevel === 'CRITICAL');

    if (critical.length > 0) {
      await step.run('send-alerts', async () => {
        // Email al equipo
        await resend.emails.send({
          from: 'alerts@viotech.pro',
          to: 'team@viotech.pro',
          subject: `🚨 ${critical.length} clientes en riesgo CRÍTICO de churn`,
          react: ChurnAlertEmail({ clients: critical })
        });

        // Crear tareas en CRM
        for (const pred of critical) {
          await createRetentionTask(pred);
        }
      });
    }

    return { total: predictions.length, critical: critical.length };
  }
);
```

#### Dashboard
```typescript
// app/dashboard/churn-risk/page.tsx
export default async function ChurnRiskPage() {
  const predictions = await fetch('/api/analytics/churn-risk').then(r => r.json());

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Predicción de Churn</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card decoration="top" decorationColor="red">
          <Text>Riesgo Crítico</Text>
          <Metric>{predictions.critical.length}</Metric>
        </Card>
        <Card decoration="top" decorationColor="orange">
          <Text>Riesgo Alto</Text>
          <Metric>{predictions.high.length}</Metric>
        </Card>
        <Card decoration="top" decorationColor="yellow">
          <Text>Riesgo Medio</Text>
          <Metric>{predictions.medium.length}</Metric>
        </Card>
      </div>

      {/* Tabla de clientes en riesgo */}
      <Card>
        <Title>Clientes en Riesgo Crítico</Title>
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Cliente</TableHeaderCell>
              <TableHeaderCell>Probabilidad</TableHeaderCell>
              <TableHeaderCell>Factores Principales</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {predictions.critical.map(pred => (
              <TableRow key={pred.clientId}>
                <TableCell>
                  <Link href={`/clients/${pred.clientId}`}>
                    {pred.clientName}
                  </Link>
                </TableCell>
                <TableCell>
                  <BadgeDelta deltaType="decrease">
                    {(pred.churnProbability * 100).toFixed(1)}%
                  </BadgeDelta>
                </TableCell>
                <TableCell>
                  <ul className="text-sm space-y-1">
                    {pred.topRiskFactors.map((f, i) => (
                      <li key={i}>• {f.description}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => executeRetentionPlan(pred.clientId)}
                    className="text-blue-600 hover:underline"
                  >
                    Iniciar Plan de Retención →
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
```

**Implementación:**
- **Semana 1-2:** Feature engineering + preparación de datos
- **Semana 3:** Desarrollo y entrenamiento del modelo
- **Semana 4:** API + Dashboard + Testing

**ROI Esperado:**
- 🎯 30-40% reducción en churn
- 🎯 $80k+ valor de retención anual
- 🎯 Aumento en LTV de clientes

---

### 3.2 ROI Analytics Automático
**Sprint 27 (2 semanas)**

[Contenido similar al documento original, adaptado a stack actual]

**ROI Esperado:**
- 🎯 40% aumento en renovaciones
- 🎯 Upselling más fácil
- 🎯 Más referrals

---

### 3.3 Benchmarking de Industria
**Sprint 28 (2 semanas)**

[Contenido similar al documento original, adaptado a stack actual]

**ROI Esperado:**
- 🎯 Diferenciación competitiva
- 🎯 Insights accionables
- 🎯 Premium positioning

---

## 📅 Plan de Implementación 2025

### Q1 2025 (Enero - Marzo)
#### Sprints 15-20: Fase I - IA y Automatización

| Sprint | Semanas | Features | Prioridad |
|--------|---------|----------|-----------|
| 15-16 | 4 | Sistema de Predicción ML | 🔥 Alta |
| 17-18 | 4 | Asistente Virtual IA | 🔥 Alta |
| 19 | 2 | Análisis de Sentimiento | ⭐ Media |
| 20 | 2 | Reportes Ejecutivos Auto | ⭐ Media |

**Entregables Q1:**
- ✅ Predicción de tiempos/costos con ML
- ✅ Asistente conversacional con GPT-4o
- ✅ Sistema de alertas proactivas
- ✅ Reportes automáticos semanales

---

### Q2 2025 (Abril - Junio)
#### Sprints 21-24: Fase II - Colaboración Tiempo Real

| Sprint | Semanas | Features | Prioridad |
|--------|---------|----------|-----------|
| 21 | 2 | Comentarios Tiempo Real | 🔥 Alta |
| 22-23 | 4 | Video Calls Integrados | ⭐ Media |
| 24 | 2 | Dashboard Tiempo Real | 🔥 Alta |

**Entregables Q2:**
- ✅ Comentarios con WebSockets + presencia
- ✅ Video calls con Daily.co + transcripción
- ✅ Dashboard live con animaciones

---

### Q3 2025 (Julio - Septiembre)
#### Sprints 25-28: Fase III - Analytics Avanzados

| Sprint | Semanas | Features | Prioridad |
|--------|---------|----------|-----------|
| 25-26 | 4 | Predicción de Churn | 🔥 Alta |
| 27 | 2 | ROI Analytics | ⭐ Media |
| 28 | 2 | Benchmarking | ⭐ Media |

**Entregables Q3:**
- ✅ Modelo de predicción de churn
- ✅ Sistema de ROI tracking automático
- ✅ Comparativas de industria

---

### Q4 2025 (Octubre - Diciembre)
#### Sprints 29-32: Polish + Optimización

- **Sprint 29:** Testing integral + QA
- **Sprint 30:** Optimización de performance
- **Sprint 31:** Documentación completa
- **Sprint 32:** Launch + Marketing

---

## 💰 ROI y Métricas de Éxito

### Inversión Total Estimada
```
Desarrollo (32 sprints × 2 devs): $320,000
Infraestructura anual: $12,000
APIs externas (OpenAI, Daily, etc.): $6,000/mes = $72,000
Total Año 1: ~$404,000
```

### ROI Proyectado Año 1

| Métrica | Actual | Objetivo 2025 | Impacto $ |
|---------|--------|---------------|-----------|
| Churn Rate | 20% | 12% (-40%) | +$80,000 |
| Conversión Ventas | 25% | 35% (+40%) | +$150,000 |
| Ticket Price | $10,000 | $12,000 (+20%) | +$200,000 |
| Clientes Nuevos | 50 | 75 (+50%) | +$250,000 |
| Tiempo Resolución | 5 días | 2.5 días (-50%) | +$100,000 |

**Revenue Adicional Proyectado: $780,000**
**ROI: 93% en Año 1**

---

### Métricas de Éxito por Fase

#### Fase I: IA
- ✅ Precisión de predicciones > 85%
- ✅ 40% reducción en aclaraciones de tickets
- ✅ 30% reducción en disputas de costos
- ✅ NPS +20 puntos

#### Fase II: Tiempo Real
- ✅ 50% reducción en tiempo de resolución
- ✅ 70% reducción en consultas de estado
- ✅ 45% aumento en engagement

#### Fase III: Analytics
- ✅ Churn prediction accuracy > 80%
- ✅ 30% reducción en churn real
- ✅ 40% aumento en renovaciones

---

## 🚀 Próximos Pasos Inmediatos

### Semana 1-2: Preparación
1. **Setup de infraestructura ML**
   - [ ] Configurar TensorFlow.js
   - [ ] Setup de Supabase pgvector
   - [ ] Configurar OpenAI API

2. **Recolección de datos**
   - [ ] Exportar datos históricos de proyectos
   - [ ] Limpiar y normalizar datos
   - [ ] Crear dataset de entrenamiento

3. **Setup de herramientas**
   - [ ] Vercel AI SDK
   - [ ] Inngest para jobs
   - [ ] Redis/Upstash para cache

### Semana 3-4: Sprint 15 Kickoff
1. **Desarrollo del predictor ML**
2. **API de predicción**
3. **Frontend básico**
4. **Testing inicial**

---

## 📚 Recursos y Documentación

### APIs y SDKs
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [Daily.co](https://docs.daily.co/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Transformers.js](https://huggingface.co/docs/transformers.js)

### Tutoriales Recomendados
- [Building AI Chatbots with Vercel AI SDK](https://vercel.com/blog/ai-sdk-3)
- [Real-time Apps with Supabase](https://supabase.com/docs/guides/realtime/quickstart)
- [ML in Node.js with TensorFlow.js](https://www.tensorflow.org/js/tutorials)

---

## 🤝 Equipo Necesario

### Recursos por Sprint
- **2 Full-Stack Developers** (React/Node.js)
- **1 ML Engineer** (part-time, para Fase I y III)
- **1 DevOps Engineer** (part-time, para infraestructura)
- **1 QA Engineer** (testing e2e)

### Skills Requeridos
- ✅ Next.js 16 + React 19
- ✅ Node.js + Express/Hono
- ✅ TensorFlow.js / ML básico
- ✅ WebSockets / Realtime
- ✅ OpenAI API / LLMs
- ✅ PostgreSQL + Prisma
- ✅ Supabase ecosystem

---

**Última Actualización:** Noviembre 2024
**Versión:** 1.0.0
**Próxima Revisión:** Diciembre 2024
**Owner:** Equipo VioTech Pro
