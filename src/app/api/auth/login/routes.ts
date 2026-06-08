import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    // Simple validation – in a real app you'd check credentials.
    if (!email || !password) {
      return NextResponse.json({ message: 'Missing credentials' }, { status: 400 });
    }

    // Return a dummy token and user data.
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
