'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';

interface Form {
  _id: string;
  title: string;
  description: string;
  version: number;
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await api.get('/forms');
      setForms(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Available Forms</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Link key={form._id} href={`/forms/${form._id}`}>
              <Card hover className="p-6">
                <h3 className="text-lg font-semibold">{form.title}</h3>
                <p className="text-gray-600 mt-2">{form.description}</p>
                <p className="text-sm text-gray-500 mt-4">Version {form.version}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}