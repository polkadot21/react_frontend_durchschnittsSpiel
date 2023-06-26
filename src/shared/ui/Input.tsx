import { DetailedHTMLProps, InputHTMLAttributes } from "react";

interface Props
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label: string;
}

export const Input: React.FC<Props> = ({ label, ...props }) => {
  return (
    <label className="flex flex-col">
      {label}
      <input {...props} />
    </label>
  );
};
