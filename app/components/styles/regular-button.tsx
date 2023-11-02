type Props = {
  content: string;
  onClick: () => void;
  overrideClasses?: string;
  type?: 'button' | 'submit' | 'reset';
  isDisabled?: boolean;
};

export const RegularButton = ({
  content,
  onClick,
  overrideClasses,
  type = 'button',
  isDisabled = false,
}: Props) => {
  return (
    <button
      className={`select-none rounded-lg bg-indigo-600 py-3 px-6 text-center align-middle font-sans text-xs font-bold 
        uppercase text-slate-200 shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg 
      hover:shadow-indigo-500/40 active:opacity-[0.85] 
        active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none 
        ${overrideClasses}
      `}
      type={type}
      data-ripple-light='true'
      onClick={onClick}
      disabled={isDisabled}
    >
      {content}
    </button>
  );
};
