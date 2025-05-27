import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  loginType: z.enum(['faculty', 'admin', 'hod'], { message: 'Invalid login type' }),
  facultyId: z.string().optional(),
  department: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message || 'Invalid input';
      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    const { email, password, loginType, facultyId, department } = parsed.data;

    await connectToDB();
    const user = await User.findOne({ email: email.toLowerCase(), role: loginType });
    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    if (loginType === 'faculty') {
      if (!facultyId || facultyId !== user.facultyId) {
        return NextResponse.json({ success: false, message: 'Invalid faculty ID' }, { status: 401 });
      }
      if (!department || department !== user.department) {
        return NextResponse.json({ success: false, message: 'Invalid department' }, { status: 401 });
      }
    }

    if (loginType === 'hod') {
      if (!department || department !== user.department) {
        return NextResponse.json({ success: false, message: 'Invalid department' }, { status: 401 });
      }
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    const userData = {
      email: user.email,
      name: user.name || 'User',
      department: user.department,
      role: user.role,
      loginTime: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      token,
      user: userData,
    }, { status: 200 });

  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ success: false, message: 'Server error. Please try again later.' }, { status: 500 });
  }
}