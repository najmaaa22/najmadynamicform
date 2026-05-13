import { Label } from "@/components/ui/label";

type Props = {
  label: string;
  required?: boolean;
  options: string[];
  error?: string;
  [key: string]: any; 
};

export default function RadioField({
  label,
  required,
  options,
  error,
  ...props
}: Props) {
  return (
    <div className="space-y-3">
      <Label className="font-medium text-slate-700 text-base">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-3 p-3 border rounded-xl hover:bg-slate-50 cursor-pointer transition"
          >
            <input
              type="radio"
              value={option}
              required={required}
              className="w-4 h-4 accent-black"
              {...props} 
            />
            <span className="text-slate-600 text-sm">{option}</span>
          </label>
        ))}
      </div>
      
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}