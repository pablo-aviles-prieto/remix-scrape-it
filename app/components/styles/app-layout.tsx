type Props = {
  children: React.ReactNode;
};

const container = 'p-16';

export const AppLayout = ({ children }: Props) => {
  return (
    <main
      className={`bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-black 
    via-slate-900 to-black min-h-[100vh] text-gray-300 ${container}`}
    >
      <div className='max-w-7xl mx-auto'>{children}</div>
    </main>
  );
};
