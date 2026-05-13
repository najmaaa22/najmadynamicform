"use client";

import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Props = {
  label: string;
  required?: boolean;
  error?: string;

  options: string[];

  value?: string[];

  onChange?: (value: string[]) => void;
};

export default function CheckboxField({
  label,
  required,
  error,
  options,
  value = [],
  onChange,
}: Props) {
  const handleCheckboxChange = (
    checked: boolean,
    option: string
  ) => {
    let updatedValues: string[];

    if (checked) {
      updatedValues = [...value, option];
    } else {
      updatedValues = value.filter(
        (item) => item !== option
      );
    }

    onChange?.(updatedValues);
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">
        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}
      </Label>

      <div className="space-y-2">
        {options.map((option) => (
          <div
            key={option}
            className="flex items-center gap-2"
          >
            <Checkbox
              id={option}
              checked={value.includes(option)}
              onCheckedChange={(checked) =>
                handleCheckboxChange(
                  checked as boolean,
                  option
                )
              }
            />

            <Label
              htmlFor={option}
              className="cursor-pointer font-normal"
            >
              {option}
            </Label>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}