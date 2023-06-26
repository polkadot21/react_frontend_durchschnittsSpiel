import { ButtonHTMLAttributes } from "react";

export enum EButtonVariant {
  PRIMARY,
  ICON,
}

interface ButtonProps extends ButtonHTMLAttributes<any> {
  variant?: EButtonVariant;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = EButtonVariant.PRIMARY,
  children,
  loading,
  ...props
}) => {
  return (
    <button
      {...props}
      className={`mt-5 text-lg border-transparent bg-indigo-500 disabled:bg-indigo-200 rounded flex items-center justify-center ${
        loading ? "" : "cursor-pointer"
      } ${
        variant === EButtonVariant.PRIMARY
          ? "text-white bg-indigo-500 disabled:bg-indigo-200 py-2.5 px-5"
          : ""
      } ${
        variant === EButtonVariant.ICON
          ? "text-black bg-transparent disabled:bg-indigo-200 p-2"
          : ""
      }`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};
