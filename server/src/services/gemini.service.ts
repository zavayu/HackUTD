import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env['GEMINI_API_KEY'] || '');

export interface GeneratedStory {
  title: string;
  description: string;
  type: 'story' | 'task' | 'bug';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours: number;
  acceptanceCriteria: string[];
}

export class GeminiService {
  private model;
  private modelNames = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest', 
    'gemini-1.5-pro',
    'gemini-pro'
  ];

  constructor() {
    const modelName = process.env['GEMINI_MODEL'] || 'gemini-1.5-flash-latest';
    this.model = genAI.getGenerativeModel({ model: modelName });
  }

  private async tryGenerateWithFallback(systemPrompt: string): Promise<string> {
    let lastError: Error | null = null;
    
    // Try the configured model first
    try {
      const result = await this.model.generateContent(systemPrompt);
      return result.response.text();
    } catch (error: any) {
      console.warn(`Primary model failed: ${error.message}`);
      lastError = error;
    }

    // Try fallback models
    for (const modelName of this.modelNames) {
      try {
        console.log(`Trying fallback model: ${modelName}`);
        const fallbackModel = genAI.getGenerativeModel({ model: modelName });
        const result = await fallbackModel.generateContent(systemPrompt);
        console.log(`Success with model: ${modelName}`);
        // Update the primary model to the working one
        this.model = fallbackModel;
        return result.response.text();
      } catch (error: any) {
        console.warn(`Model ${modelName} failed: ${error.message}`);
        lastError = error;
      }
    }

    throw lastError || new Error('All models failed');
  }

  async generateStory(prompt: string, context?: string): Promise<GeneratedStory> {
    const systemPrompt = `You are a product management AI assistant. Generate a user story based on the user's request.

IMPORTANT: You must respond with ONLY valid JSON, no markdown, no code blocks, no additional text.

The JSON must follow this exact structure:
{
  "title": "Brief story title (max 100 chars)",
  "description": "Detailed description as a user story: 'As a [user], I want [feature], so that [benefit]'",
  "type": "story",
  "priority": "medium",
  "estimatedHours": 8,
  "acceptanceCriteria": [
    "Criterion 1",
    "Criterion 2",
    "Criterion 3"
  ]
}

Rules:
- title: Clear, concise, action-oriented
- description: Follow user story format
- type: Must be "story", "task", or "bug"
- priority: Must be "low", "medium", "high", or "critical"
- estimatedHours: Realistic estimate (1-40 hours)
- acceptanceCriteria: 3-5 specific, testable criteria

${context ? `\nProject Context:\n${context}` : ''}

User Request: ${prompt}

Respond with ONLY the JSON object, nothing else.`;

    try {
      const text = await this.tryGenerateWithFallback(systemPrompt);

      // Clean up response - remove markdown code blocks if present
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      const story = JSON.parse(cleanedText);

      // Validate the response
      if (!story.title || !story.description || !story.type || !story.priority) {
        throw new Error('Invalid story structure from AI');
      }

      return story;
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to generate story: ${error.message}`);
    }
  }

  async generateMultipleStories(
    prompt: string,
    count: number = 3,
    context?: string
  ): Promise<GeneratedStory[]> {
    const systemPrompt = `You are a product management AI assistant. Generate ${count} related user stories based on the user's request.

IMPORTANT: You must respond with ONLY valid JSON array, no markdown, no code blocks, no additional text.

The JSON must be an array of story objects following this structure:
[
  {
    "title": "Brief story title (max 100 chars)",
    "description": "Detailed description as a user story",
    "type": "story",
    "priority": "medium",
    "estimatedHours": 8,
    "acceptanceCriteria": ["Criterion 1", "Criterion 2", "Criterion 3"]
  }
]

${context ? `\nProject Context:\n${context}` : ''}

User Request: ${prompt}

Generate exactly ${count} stories. Respond with ONLY the JSON array, nothing else.`;

    try {
      const text = await this.tryGenerateWithFallback(systemPrompt);

      // Clean up response
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      const stories = JSON.parse(cleanedText);

      if (!Array.isArray(stories)) {
        throw new Error('Expected array of stories');
      }

      return stories;
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to generate stories: ${error.message}`);
    }
  }

  async enhanceStory(story: Partial<GeneratedStory>): Promise<GeneratedStory> {
    const systemPrompt = `You are a product management AI assistant. Enhance and complete this user story.

IMPORTANT: You must respond with ONLY valid JSON, no markdown, no code blocks, no additional text.

Current story:
${JSON.stringify(story, null, 2)}

Enhance it by:
- Improving the title if needed
- Expanding the description with user story format
- Adding or improving acceptance criteria
- Suggesting appropriate priority and estimates

Respond with the complete enhanced story in this JSON format:
{
  "title": "Enhanced title",
  "description": "Enhanced description",
  "type": "story",
  "priority": "medium",
  "estimatedHours": 8,
  "acceptanceCriteria": ["Criterion 1", "Criterion 2", "Criterion 3"]
}

Respond with ONLY the JSON object, nothing else.`;

    try {
      const text = await this.tryGenerateWithFallback(systemPrompt);

      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      const enhancedStory = JSON.parse(cleanedText);
      return enhancedStory;
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to enhance story: ${error.message}`);
    }
  }
}

export const geminiService = new GeminiService();
