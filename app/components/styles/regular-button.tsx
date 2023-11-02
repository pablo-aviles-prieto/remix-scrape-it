type Props = {
  content: string;
  onClick: () => void;
  overrideClasses?: string;
  type?: 'button' | 'submit' | 'reset';
};

export const RegularButton = ({
  content,
  onClick,
  overrideClasses,
  type = 'button',
}: Props) => {
  return (
    <button
      className={`select-none rounded-lg bg-indigo-600 py-3 px-6 text-center align-middle font-sans text-xs font-bold 
        uppercase text-slate-200 shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg 
      hover:shadow-indigo-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] 
        active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none 
        ${overrideClasses}
      `}
      type={type}
      data-ripple-light='true'
      onClick={onClick}
    >
      {content}
    </button>
  );
};
