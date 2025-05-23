import clsx from "clsx";

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  type?: string;
}

export function InputField({ label, name, value, onChange, placeholder, readOnly, type = "text" }: InputFieldProps) {
  return (
    <div className="space-y-0.5">
      <label className="block text-gray-800 text-xs font-bold">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={clsx(
          "w-full py-1.5 px-2.5 text-sm border rounded-md focus:outline-none focus:ring-1",
          readOnly ? "bg-gray-100 cursor-not-allowed " : "focus:ring-blue-500"
        )}
        style={{ fontSize: '0.75rem' }}
      />
    </div>
  );
}
