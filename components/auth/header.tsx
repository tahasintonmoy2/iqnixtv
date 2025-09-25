interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-between gap-y-4">
      <h1 className="text-3xl font-semibold">{title}</h1>
    </div>
  );
};