import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * AI Quiz Generation endpoint.
 *
 * This is a stub that returns a placeholder quiz. Replace the body of
 * `generateQuestions` with a real AI provider call (e.g. OpenAI, Anthropic)
 * once you have an API key configured as an environment variable.
 */

function generateQuestions(
  title: string,
  difficulty: 'easy' | 'hard'
): any[] {
  const count = difficulty === 'hard' ? 10 : 5;
  return Array.from({ length: count }, (_, i) => ({
    id: `q${i + 1}`,
    question: `Sample ${difficulty} question ${i + 1} for "${title}"`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 0,
    explanation: 'This is a placeholder explanation.',
  }));
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, difficulty } = await request.json();
    if (!title || !difficulty) {
      return NextResponse.json(
        { error: 'title and difficulty are required' },
        { status: 400 }
      );
    }

    const questions = generateQuestions(title, difficulty);
    return NextResponse.json(questions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
