import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    // Simple validation – in a real app you'd check credentials.
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    // Return a dummy token and user data.
    const dummyUser = {
      _id: 'reg-12345',
      email,
      name,
      role: 'user' as const,
    };
    const token = 'dummy-register-token';
    return NextResponse.json({ token, user: dummyUser }, { status: 200 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
