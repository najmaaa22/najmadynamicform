'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import Select from 'react-select';

import api from '@/lib/api';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Label,
} from '@/components/ui/label';

import {
  Textarea,
} from '@/components/ui/textarea';

import {
  Badge,
} from '@/components/ui/badge';

import {
  Plus,
  Trash2,
  ArrowLeft,
} from 'lucide-react';

type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date';

interface FormField {
  fieldId: string;

  label: string;

  type: FieldType;

  required: boolean;

  options?: string[];

  correctAnswer?: string | string[];
}

interface UserOption {
  value: string;

  label: string;
}

export default function EditFormPage() {
  const params = useParams();

  const router = useRouter();

  const id = params?.id as string;

  const [loading, setLoading] =
    useState(false);

  const [fetching, setFetching] =
    useState(true);

  const [title, setTitle] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [isQuiz, setIsQuiz] =
    useState(false);

  const [fields, setFields] =
    useState<FormField[]>([]);

  const [availableUsers, setAvailableUsers] =
    useState<UserOption[]>([]);

  const [selectedUsers, setSelectedUsers] =
    useState<UserOption[]>([]);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);

        // USERS
        const usersRes =
          await api.get('/auth/users');

        const users =
          usersRes.data?.data || [];

        const mappedUsers =
          users.map((user: any) => ({
            value: user._id,
            label: `${user.name} (${user.email})`,
          }));

        setAvailableUsers(mappedUsers);

        // FORM
        const formRes =
          await api.get(`/forms/${id}`);

        const form =
          formRes.data?.data;

        setTitle(form.title || '');

        setDescription(
          form.description || ''
        );

        setIsQuiz(form.isQuiz || false);

        setFields(form.fields || []);

        // WHITELIST USERS
        const selected =
          (form.allowedUsers || [])
            .map((uid: string) =>
              mappedUsers.find(
                (u: UserOption) =>
                  u.value === uid
              )
            )
            .filter(Boolean);

        setSelectedUsers(
          selected as UserOption[]
        );
      } catch (error: any) {
        console.log(error);

        alert(
          error?.response?.data
            ?.message ||
            'Failed to load form'
        );
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // ADD FIELD
  const addField = () => {
    setFields([
      ...fields,
      {
        fieldId:
          Date.now().toString(),

        label: '',

        type: 'text',

        required: false,

        options: [],
      },
    ]);
  };

  // UPDATE FIELD
  const updateField = (
    index: number,
    key: keyof FormField,
    value: any
  ) => {
    const updated = [...fields];

    updated[index] = {
      ...updated[index],
      [key]: value,
    };

    setFields(updated);
  };

  // REMOVE FIELD
  const removeField = (
    index: number
  ) => {
    const updated = [...fields];

    updated.splice(index, 1);

    setFields(updated);
  };

  // UPDATE FORM
  const updateForm = async () => {
    try {
      if (!title.trim()) {
        alert('Title is required');

        return;
      }

      setLoading(true);

      await api.put(
        `/forms/${id}`,
        {
          title,
          description,
          isQuiz,
          fields,
          allowedUsers:
            selectedUsers.map(
              (u) => u.value
            ),
        }
      );

      alert(
        'Form updated successfully'
      );

      router.push('/admin/forms');
    } catch (error: any) {
      console.log(error);

      alert(
        error?.response?.data
          ?.message ||
          'Failed to update form'
      );
    } finally {
      setLoading(false);
    }
  };

  // LOADING
  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-medium">
        Loading form...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">

      <div className="max-w-5xl mx-auto space-y-6">

        {/* BACK */}
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() =>
            router.push(
              '/admin/forms'
            )
          }
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="rounded-3xl shadow-xl border-0">

          <CardHeader className="border-b bg-white rounded-t-3xl">

            <div className="flex items-center justify-between">

              <div>
                <CardTitle className="text-3xl font-bold">
                  Edit Form
                </CardTitle>

                <p className="text-slate-500 text-sm mt-1">
                  Update your form
                  details and fields
                </p>
              </div>

              <Badge variant="secondary">
                Version Update
              </Badge>
            </div>

          </CardHeader>

          <CardContent className="space-y-8 p-6">

            {/* BASIC DETAILS */}
            <div className="space-y-5">

              <div className="space-y-2">

                <Label>
                  Form Title
                </Label>

                <Input
                  placeholder="Enter form title"
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-2">

                <Label>
                  Description
                </Label>

                <Textarea
                  placeholder="Enter form description"
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="flex items-center gap-3">

                <input
                  type="checkbox"
                  checked={isQuiz}
                  onChange={(e) =>
                    setIsQuiz(
                      e.target.checked
                    )
                  }
                />

                <Label>
                  Enable Quiz Mode
                </Label>
              </div>

              {/* USERS */}
              <div className="space-y-2">

                <Label>
                  Allowed Users
                </Label>

                <Select
                  isMulti
                  options={
                    availableUsers
                  }
                  value={
                    selectedUsers
                  }
                  onChange={(
                    selected
                  ) =>
                    setSelectedUsers(
                      (selected ||
                        []) as UserOption[]
                    )
                  }
                  placeholder="Select users..."
                />
              </div>

            </div>

            {/* FIELDS */}
            <div className="space-y-6">

              <div className="flex items-center justify-between">

                <h2 className="text-xl font-semibold">
                  Form Fields
                </h2>

                <Button
                  variant="outline"
                  onClick={addField}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Field
                </Button>

              </div>

              {fields.map(
                (
                  field,
                  index
                ) => (
                  <Card
                    key={
                      field.fieldId
                    }
                    className="border"
                  >
                    <CardContent className="space-y-5 pt-6">

                      <div className="space-y-2">

                        <Label>
                          Field Label
                        </Label>

                        <Input
                          placeholder="Enter label"
                          value={
                            field.label
                          }
                          onChange={(
                            e
                          ) =>
                            updateField(
                              index,
                              'label',
                              e.target
                                .value
                            )
                          }
                        />
                      </div>

                      {/* TYPE */}
                      <div className="space-y-2">

                        <Label>
                          Field Type
                        </Label>

                        <select
                          value={
                            field.type
                          }
                          onChange={(
                            e
                          ) =>
                            updateField(
                              index,
                              'type',
                              e.target
                                .value
                            )
                          }
                          className="w-full border rounded-md h-10 px-3 bg-white"
                        >
                          <option value="text">
                            Text
                          </option>

                          <option value="number">
                            Number
                          </option>

                          <option value="textarea">
                            Textarea
                          </option>

                          <option value="select">
                            Select
                          </option>

                          <option value="radio">
                            Radio
                          </option>

                          <option value="checkbox">
                            Checkbox
                          </option>

                          <option value="date">
                            Date
                          </option>
                        </select>

                      </div>

                      {/* OPTIONS */}
                      {(field.type ===
                        'select' ||
                        field.type ===
                          'radio' ||
                        field.type ===
                          'checkbox') && (
                        <div className="space-y-2">

                          <Label>
                            Options
                          </Label>

                          <Input
                            placeholder="Option1, Option2"
                            value={(
                              field.options ||
                              []
                            ).join(', ')}
                            onChange={(
                              e
                            ) =>
                              updateField(
                                index,
                                'options',
                                e.target.value
                                  .split(',')
                                  .map(
                                    (
                                      option
                                    ) =>
                                      option.trim()
                                  )
                              )
                            }
                          />

                        </div>
                      )}

                      {/* QUIZ ANSWER */}
                      {isQuiz && (
                        <div className="space-y-2">

                          <Label>
                            Correct Answer
                          </Label>

                          <Input
                            placeholder="Correct answer"
                            value={
                              field.correctAnswer ||
                              ''
                            }
                            onChange={(
                              e
                            ) =>
                              updateField(
                                index,
                                'correctAnswer',
                                e.target
                                  .value
                              )
                            }
                          />

                        </div>
                      )}

                      {/* REQUIRED */}
                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2">

                          <input
                            type="checkbox"
                            checked={
                              field.required
                            }
                            onChange={(
                              e
                            ) =>
                              updateField(
                                index,
                                'required',
                                e.target
                                  .checked
                              )
                            }
                          />

                          <Label>
                            Required
                          </Label>

                        </div>

                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            removeField(
                              index
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>

                      </div>

                    </CardContent>
                  </Card>
                )
              )}

            </div>

            {/* SUBMIT */}
            <Button
              className="w-full h-11 text-base"
              disabled={loading}
              onClick={updateForm}
            >
              {loading
                ? 'Updating...'
                : 'Update Form'}
            </Button>

          </CardContent>

        </Card>

      </div>
    </div>
  );
}