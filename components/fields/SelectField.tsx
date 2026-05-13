import { Label } from "@/components/ui/label";

interface Props {
  label: string;
  required?: boolean;
  options: string[];
  error?: string;
  [key: string]: any; 
}

export default function SelectField({
  label,
  required,
  options,
  error,
  ...props
}: Props) {
  return (
    <div className="space-y-2">
      <Label className="text-slate-700 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <select
        required={required}
        className={`w-full border rounded-xl p-3 bg-white hover:border-slate-400 transition cursor-pointer outline-none focus:ring-2 focus:ring-black/5 ${
          error ? "border-red-500" : "border-slate-200"
        }`}
        {...props} 
      >
        <option value="">Select an option</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}