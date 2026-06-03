import { Label } from "@/components/ui/label";

interface Props {
  label: string;
  required?: boolean;
  error?: string;
  [key: string]: any; 
}

export default function TextareaField({
  label,
  required,
  error,
  ...props
}: Props) {
  return (
    <div className="space-y-2">
      <Label className="text-slate-700 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <textarea
        required={required}
        className={`w-full border rounded-xl p-3 min-h-25 bg-white hover:border-slate-400 transition outline-none focus:ring-2 focus:ring-black/5 ${
          error ? "border-red-500" : "border-slate-200"
        }`}
        {...props} 
      />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}