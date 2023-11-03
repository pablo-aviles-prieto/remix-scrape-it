import { CustomSpinner } from './custom-spinner';

type Props = {
  content: string;
  onClick: () => void;
  overrideClasses?: string;
  type?: 'button' | 'submit' | 'reset';
  isDisabled?: boolean;
  color?: 'primary' | 'secondary';
  isLoading?: boolean;
};

export const RegularButton = ({
  content,
  onClick,
  overrideClasses,
  type = 'button',
  isDisabled = false,
  color = 'primary',
  isLoading = false,
}: Props) => {
  const isPrimaryColor = color === 'primary';
  return (
    <button
      className={`select-none rounded-lg ${
        isPrimaryColor ? 'border-0' : 'border border-indigo-600'
      } ${
        isPrimaryColor ? 'bg-indigo-600' : 'bg-transparent'
      } py-3 px-6 text-center align-middle font-sans text-xs font-bold 
        uppercase ${
          isPrimaryColor ? 'text-slate-200' : 'text-indigo-600'
        } shadow-md ${
        isPrimaryColor ? 'shadow-indigo-500/20' : 'shadow-indigo-300/20'
      } transition-all hover:shadow-lg 
      ${
        isPrimaryColor
          ? 'hover:shadow-indigo-500/40'
          : 'hover:shadow-indigo-300/30'
      } active:opacity-[0.85] 
        active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none 
        flex gap-2 ${overrideClasses}
      `}
      type={type}
      data-ripple-light='true'
      onClick={onClick}
      disabled={isDisabled}
    >
      {isLoading && (
        <CustomSpinner size='sm' classes='border-violet-400 w-5 h-5' />
      )}
      {content}
    </button>
  );
};
