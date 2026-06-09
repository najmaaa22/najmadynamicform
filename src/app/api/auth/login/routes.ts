import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ message: 'Missing credentials' }, { status: 400 });
    }

    const dummyUser = {
      _id: '12345',
      email,
      name: 'Demo User',
      role: 'user' as const,
    };
    const token = 'dummy-token';

    return NextResponse.json({ token, user: dummyUser }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
