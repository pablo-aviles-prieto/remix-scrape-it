/* eslint-disable max-len */

type IProps = {
  classes?: string;
  size: 'xs' | 'sm' | 'lg' | 'xl';
};

type IBorderOptions = {
  [Key in IProps['size']]: string;
};

export const CustomSpinner = ({ classes, size }: IProps) => {
  const borderOptions: IBorderOptions = {
    xs: 'border-2',
    sm: 'border-4',
    lg: 'border-6',
    xl: 'border-8',
  };
  return (
    <div
      className={`border-solid rounded-full shadow-md animate-spin border-t-transparent ${classes} ${borderOptions[size]}`}
    />
  );
};
