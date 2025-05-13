import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserRequestBody {
  name: string;
  email: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const users: User[] = await prisma.user.findMany();
    res.status(200).json(users);
  } else if (req.method === 'POST') {
    const { name, email }: CreateUserRequestBody = req.body;
    const user: User = await prisma.user.create({
      data: { name, email },
    });
    res.status(201).json(user);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
