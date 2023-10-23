type Props = {
  children: JSX.Element;
};

export const AppLayout = ({ children }: Props) => {
  return (
    <div
      className='bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-black 
  via-slate-900 to-black min-h-[100vh] text-gray-300'
    >
      {children}
    </div>
  );
};
